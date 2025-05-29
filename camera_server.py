import cv2
import torch
import base64
import numpy as np
import threading
import eventlet
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO
from flask_cors import CORS
from datetime import datetime

eventlet.monkey_patch()

# Khởi tạo Flask và cấu hình kết nối MySQL
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://root:11082003@localhost:3306/db_plantify'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False  # Tắt việc theo dõi thay đổi
db = SQLAlchemy(app)

# Cấu hình WebSocket
CORS(app, resources={r"/*": {"origins": "*"}})
socketio = SocketIO(app,
    cors_allowed_origins="*",
    async_mode='eventlet',
    ping_timeout=30000,
    ping_interval=25000,
    max_http_buffer_size=50 * 1024 * 1024  # Tăng kích thước buffer lên 50MB
)

# Load model YOLOv5 đã được train
try:
    model = torch.hub.load('ultralytics/yolov5', 'custom', path='best.pt')
    model.conf = 0.2 
    model.iou = 0.45 
    model.imgsz = 640
    model_loaded = True
except Exception as e:
    print(f"Không thể tải model: {e}")
    model_loaded = False

# Cấu hình camera và threading
camera_on = False
camera_thread = None
camera_lock = threading.Lock()

# Các gợi ý thuốc và giải pháp
suggestions = { 
    "Healthy_Leaf_of_Jackfruit": "Lá cây mít khỏe mạnh! Tiếp tục duy trì tưới nước và bón phân định kỳ.",
    "Algal_Leaf_Spot_of_Jackfruit": "Phát hiện bệnh đốm tảo trên lá mít! Cắt tỉa lá bị nhiễm, tránh tưới nước lên lá, và sử dụng thuốc gốc đồng để kiểm soát bệnh.",
    "Black_Spot_of_Jackfruit": "Phát hiện bệnh đốm đen trên lá mít! Cần loại bỏ lá bị bệnh, tăng cường bón phân kali, và sử dụng thuốc chứa azoxystrobin hoặc mancozeb để kiểm soát."
}

# Model cho bảng Plants (thêm vào để tránh lỗi khi tham chiếu)
class Plants(db.Model):
    __tablename__ = 'plants'
    plant_id = db.Column(db.Integer, primary_key=True)
    plant_name = db.Column(db.String(100), nullable=False)
    # Thêm các trường khác nếu cần

# Model cho bảng Users (thêm vào để tránh lỗi khi tham chiếu)
class Users(db.Model):
    __tablename__ = 'users'
    user_id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), nullable=False)
    # Thêm các trường khác nếu cần

# Model cho bảng RecommendSystem
class RecommendSystem(db.Model):
    __tablename__ = 'recommend_system'  # Tên bảng trong MySQL
    recommendId = db.Column(db.Integer, primary_key=True)
    diseaseName = db.Column(db.String(100), nullable=False)
    recommendedFertilizer = db.Column(db.String(100))
    recommendedPesticide = db.Column(db.String(100))
    solution = db.Column(db.String(255))

    # Foreign key relation
    plant_id = db.Column(db.Integer, db.ForeignKey('plants.plant_id'), nullable=False)
    plant = db.relationship('Plants', backref=db.backref('recommend_systems', lazy=True))

# Model cho bảng Notifications
class Notifications(db.Model):
    __tablename__ = 'notifications'  # Tên bảng trong MySQL
    notificationId = db.Column(db.Integer, primary_key=True)
    message = db.Column(db.String(255), nullable=False)
    isRead = db.Column(db.Boolean, default=False)
    createdAt = db.Column(db.DateTime, default=datetime.utcnow)

    # Foreign key relation
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    user = db.relationship('Users', backref=db.backref('notifications', lazy=True))

    recommend_system_id = db.Column(db.Integer, db.ForeignKey('recommend_system.recommendId'), nullable=False)
    recommend_system = db.relationship('RecommendSystem', backref=db.backref('notifications', lazy=True))

# Hàm lưu thông tin thuốc vào bảng RecommendSystem
def save_recommendation(disease_name, fertilizer, pesticide, solution, plant_id):
    try:
        recommend = RecommendSystem(
            diseaseName=disease_name,
            recommendedFertilizer=fertilizer,
            recommendedPesticide=pesticide,
            solution=solution,
            plant_id=plant_id
        )
        db.session.add(recommend)
        db.session.commit()  # Lưu vào database
        return recommend
    except Exception as e:
        print(f"Lỗi khi lưu recommendation: {e}")
        db.session.rollback()
        return None

# Hàm gửi thông báo vào bảng Notifications và qua WebSocket
def send_notification_to_website(user_id, recommend_system):
    try:
        notification = Notifications(
            message=f"Phát hiện bệnh {recommend_system.diseaseName} trên cây {recommend_system.plant_id}. {recommend_system.solution}",
            user_id=user_id,
            recommend_system_id=recommend_system.recommendId
        )
        db.session.add(notification)
        db.session.commit()  # Lưu vào database

        # Gửi thông báo qua WebSocket
        socketio.emit('new_notification', {'message': notification.message, 'createdAt': notification.createdAt.strftime('%Y-%m-%d %H:%M:%S')})
    except Exception as e:
        print(f"Lỗi khi gửi notification: {e}")
        db.session.rollback()

# Biến global để theo dõi client đã kết nối
connected_clients = set()

# Hàm xử lý camera và stream video
def detect_and_stream():
    global camera_on
    try:
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            print("Không thể mở camera!")
            camera_on = False
            return
            
        print("Camera đã được mở và đang phát trực tiếp")
        
        # Thiết lập độ phân giải camera thấp hơn để tăng hiệu suất
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        
        # Thiết lập các tham số nén JPEG
        encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), 70]  # Chất lượng 70%
        
        frame_count = 0
        last_emit_time = datetime.now()
        
        while camera_on:
            ret, frame = cap.read()
            if not ret:
                print("Không thể đọc khung hình từ camera!")
                break
            
            frame_count += 1
            
            # Chỉ xử lý mỗi 3 frame để giảm tải CPU và mạng
            if frame_count % 3 != 0:
                eventlet.sleep(0.01)
                continue
                
            # Nếu không có client nào kết nối, không cần phân tích ảnh
            if not connected_clients:
                print("Không có client kết nối, bỏ qua xử lý frame")
                eventlet.sleep(0.1)
                continue
                
            try:
                current_time = datetime.now()
                time_diff = (current_time - last_emit_time).total_seconds()
                
                if model_loaded:
                    # Giảm kích thước frame trước khi phân tích để tăng tốc
                    if frame.shape[0] > 480 or frame.shape[1] > 640:
                        frame_resized = cv2.resize(frame, (640, 480))
                    else:
                        frame_resized = frame
                        
                    results = model(frame_resized)
                    labels = results.pandas().xyxy[0]['name'].tolist()
                    
                    # Vẽ kết quả lên frame gốc
                    annotated_frame = results.render()[0]

                    detected_label = labels[0] if labels else "unknown"
                    advice = suggestions.get(detected_label, "Không xác định, vui lòng kiểm tra thủ công.")

                    # Nếu phát hiện bệnh (ngoài "healthy")
                    if detected_label != "Healthy_Leaf_of_Jackfruit" and detected_label != "unknown":
                        disease_name = detected_label
                        fertilizer = "Phân bón NPK 20-20-20"
                        pesticide = "Thuốc trừ sâu gốc đồng"
                        solution = "Cắt tỉa lá bị nhiễm, tưới nước hợp lý."
                        plant_id = 1  # ID cây, giả sử là cây mít

                        # Chỉ lưu notification nếu đã qua 30 giây từ lần gửi trước
                        if time_diff > 30:
                            recommend = save_recommendation(disease_name, fertilizer, pesticide, solution, plant_id)
                            if recommend:
                                send_notification_to_website(user_id=1, recommend_system=recommend)
                else:
                    annotated_frame = frame
                    detected_label = "Model không được tải"
                    advice = "Vui lòng kiểm tra lại cài đặt model."
                
                # Chuyển đổi frame thành base64 để gửi qua WebSocket
                _, buffer = cv2.imencode('.jpg', annotated_frame, encode_param)
                base64_img = base64.b64encode(buffer).decode()
                
                # Log kích thước dữ liệu để kiểm tra
                img_size = len(base64_img)
                print(f"Frame size: {img_size} bytes, detected: {detected_label}")

                # Gửi dữ liệu qua WebSocket
                with camera_lock:
                    if camera_on and connected_clients:  # Kiểm tra camera vẫn bật và có client kết nối
                        try:
                            socketio.emit('image', {'image': base64_img, 'label': detected_label, 'advice': advice})
                            print(f"Đã gửi frame ({img_size} bytes) tới {len(connected_clients)} client(s)")
                            last_emit_time = current_time
                        except Exception as emit_error:
                            print(f"Lỗi khi gửi frame qua WebSocket: {emit_error}")
                
                # Thêm một khoảng nghỉ nhỏ để giảm tải CPU
                eventlet.sleep(0.1)
                
            except Exception as e:
                print(f"Lỗi khi xử lý frame: {e}")
                eventlet.sleep(0.1)
                continue
                
    except Exception as e:
        print(f"Lỗi trong luồng camera: {e}")
    finally:
        if 'cap' in locals() and cap is not None:
            cap.release()
        print("Camera đã được đóng")

# API để bật/tắt camera
@app.route('/toggle_camera', methods=['POST'])
def toggle_camera():
    global camera_on, camera_thread
    data = request.get_json()
    new_status = data.get('status', False)
    
    with camera_lock:
        # Nếu trạng thái không thay đổi, trả về ngay
        if camera_on == new_status:
            return jsonify({"message": f"Camera đã {'bật' if camera_on else 'tắt'} sẵn"}), 200
            
        camera_on = new_status

    if camera_on:
        if camera_thread is None or not camera_thread.is_alive():
            camera_thread = threading.Thread(target=detect_and_stream)
            camera_thread.daemon = True  # Đảm bảo thread sẽ tắt khi chương trình chính kết thúc
            camera_thread.start()
        return jsonify({"message": "Camera bật"}), 200
    else:
        # Camera sẽ tự tắt trong vòng lặp detect_and_stream
        return jsonify({"message": "Camera tắt"}), 200

# Sự kiện WebSocket khi có kết nối
@socketio.on('connect')
def handle_connect():
    client_id = request.sid
    connected_clients.add(client_id)
    print(f"Client connected: {client_id}, total clients: {len(connected_clients)}")
    
    # Gửi thông báo đến client rằng server đã sẵn sàng
    socketio.emit('server_status', {'status': 'connected', 'camera': camera_on})
    
    # Nếu camera đang bật, thông báo cho client
    if camera_on:
        print(f"Camera đang bật, thông báo cho client {client_id}")

# Thêm error handlers
@socketio.on_error_default
def default_error_handler(e):
    print(f'SocketIO error: {str(e)}')

@socketio.on('disconnect')
def handle_disconnect():
    client_id = request.sid
    if client_id in connected_clients:
        connected_clients.remove(client_id)
    print(f'Client disconnected: {client_id}, remaining clients: {len(connected_clients)}')

# Thêm route kiểm tra trạng thái server
@app.route('/status', methods=['GET'])
def server_status():
    return jsonify({
        "status": "running",
        "camera": camera_on,
        "model_loaded": model_loaded,
        "connected_clients": len(connected_clients)
    }), 200

# Thêm route kiểm tra kết nối trực tiếp
@app.route('/check-connection', methods=['GET'])
def check_connection():
    # Trả về ảnh test đơn giản để kiểm tra khả năng truyền ảnh
    try:
        # Tạo một ảnh đơn giản với OpenCV
        test_image = np.zeros((200, 400, 3), dtype=np.uint8)
        # Vẽ chữ lên ảnh
        cv2.putText(test_image, "Connection OK", (50, 100), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        
        # Chuyển đổi ảnh thành base64
        _, buffer = cv2.imencode('.jpg', test_image)
        base64_img = base64.b64encode(buffer).decode()
        
        return jsonify({
            "status": "success",
            "message": "Connection established successfully",
            "test_image": base64_img,
            "camera_status": camera_on,
            "clients": len(connected_clients)
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Error generating test image: {str(e)}"
        }), 500

# Thêm endpoint để khởi động lại camera nếu cần
@app.route('/restart-camera', methods=['POST'])
def restart_camera():
    global camera_on, camera_thread
    
    try:
        # Tắt camera nếu đang bật
        if camera_on:
            camera_on = False
            # Đợi một chút để camera thread kết thúc
            eventlet.sleep(1)
        
        # Bật lại camera
        camera_on = True
        if camera_thread is None or not camera_thread.is_alive():
            camera_thread = threading.Thread(target=detect_and_stream)
            camera_thread.daemon = True
            camera_thread.start()
            
        return jsonify({
            "status": "success",
            "message": "Camera restarted successfully"
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Error restarting camera: {str(e)}"
        }), 500

# Chạy Flask app với WebSocket
if __name__ == '__main__':
    try:
        # Tạo bảng nếu chưa tồn tại
        with app.app_context():
            db.create_all()
        
        print("Server khởi động tại http://0.0.0.0:5000")
        app.debug = True
        socketio.run(app,
            host='0.0.0.0',
            port=5000,
            allow_unsafe_werkzeug=True)
    except Exception as e:
        print(f"Lỗi khi khởi động server: {e}") 