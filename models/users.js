import mongoose from 'mongoose';
const {Schema} = mongoose;

const userSchema = new Schema({
    email: {
        type: String, 
        required: [true, 'El email es requerido'],
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Por favor ingrese un email válido']
    },
    password: {
        type: String,
        required: [true, 'La contraseña es obligatoria'],
        minlength: [8, 'La contraseña debe tener al menos 8 caracteres']
    },
    name: {
        type: String, 
        required: [true, 'El nombre es requerido'],
        maxlength: [30, 'El nombre no puede tener más de 50 caracteres']
    },
    lastname: {
        type: String, 
        required: [true, 'El apellido es requerido'],
        maxlength: [30, 'El apellido no puede tener más de 50 caracteres']
    },
    favorites: {
        type: [Number],
        uniqueItems: true,
        validate: {
            validator: function(arr) {
                return arr.length <= 30;
            },
            message: 'Máximo 30 favoritos permitidos'
        }
    },
    picture: {
        type: String,
        default: ''
    },
    date: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
}, {
    timestamps: true,
    toJSON: {
        transform: function(doc, ret) {
            delete ret.password;
            return ret;
        }
    }
});

// Middleware para encriptar contraseña antes de guardar (async sin next: compatible Mongoose 8+)
userSchema.pre('save', async function() {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Método para comparar contraseñas
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);