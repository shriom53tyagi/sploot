const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Schema = mongoose.Schema;

const UserSchema = new Schema(
    {
        email: {
            type: String,
            trim: true,
            unique: true,
            sparse: true
        },
        password: {
            type: String,
            default: null
        },
        name: {
            type: String
        },
        birth_date: {
            type: String
        },
        age: {
            type: Number
        },
        status : {
            type: Number
        }
    },

    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    }
);

UserSchema.methods.isValidPassword = function(password) {
    return bcrypt.compare(password, this.password);
};

// Before Saving hash the password with bcrypt, using the default 10 rounds for salt
UserSchema.pre('save', function(next) {
    if (this.password !== '' && this.isModified('password')) {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(this.password, salt, (err, res) => {
                this.password = res;
                next();
            });
        });
    } else {
        next();
    }
});


const User = mongoose.model('user', UserSchema);

module.exports = { User };
