const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        required: true,
        type: String
    },
    email: {
        required: true,
        type: String,
        unique: true,
        validate: {
            validator: function (v) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: 'Invalid email address.'
        }
    },
    password: {
        required: true,
        type: String,
        minlength: 8,
        validate: {
            validator: function (v) {
                return v.length>=8;
            },
            message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
        }
    },
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
});

const User = mongoose.model('User', UserSchema);

module.exports = { User };
