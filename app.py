from flask import Flask, render_template, request, jsonify, redirect, url_for, session, send_from_directory
import os
import json

app = Flask(__name__)
app.secret_key = 'your_secret_key_here'  # Change this to a secure secret key

# Database file path
DB_FILE = 'users.json'

def load_users():
    if os.path.exists(DB_FILE):
        with open(DB_FILE, 'r') as f:
            return json.load(f)
    return {}

def save_users(users):
    with open(DB_FILE, 'w') as f:
        json.dump(users, f, indent=4)

@app.route('/')
def index():
    if 'user_id' in session:
        return render_template('index.html')
    return redirect(url_for('auth'))

@app.route('/auth')
def auth():
    return render_template('auth.html')

@app.route('/static/<path:filename>')
def serve_static(filename):
    return send_from_directory('static', filename)

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    users = load_users()
    for user_id, user in users.items():
        if user['email'] == email and user['password'] == password:
            session['user_id'] = user_id
            return jsonify({'success': True, 'message': 'Login successful'})
    
    return jsonify({'success': False, 'message': 'Invalid credentials'}), 401

@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    store_name = data.get('storeName')
    
    users = load_users()
    
    # Check if email already exists
    for user in users.values():
        if user['email'] == email:
            return jsonify({'success': False, 'message': 'Email already exists'}), 400
    
    # Generate new user ID
    user_id = str(len(users) + 1)
    
    # Add new user
    users[user_id] = {
        'name': name,
        'email': email,
        'password': password,
        'store_name': store_name
    }
    
    save_users(users)
    session['user_id'] = user_id
    return jsonify({'success': True, 'message': 'Signup successful'})

@app.route('/logout')
def logout():
    session.pop('user_id', None)
    return redirect(url_for('auth'))

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000) 