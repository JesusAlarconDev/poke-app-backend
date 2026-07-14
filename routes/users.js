import express from 'express';
import User from '../models/users.js';
import jwt from 'jsonwebtoken';
import authenticateToken from '../middlewares/auth.js';

const router = express.Router();

const validateEmail = (email) => {
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!email || typeof email !== 'string') {
        return { valid: false, message: 'El email es requerido' };
    }
    if (!emailRegex.test(email)) {
        return { valid: false, message: 'Por favor ingrese un email válido' };
    }
    return { valid: true };
};

const validatePassword = (password) => {
    if (!password || typeof password !== 'string') {
        return { valid: false, message: 'La contraseña es requerida' };
    }
    if (password.length < 8) {
        return { valid: false, message: 'La contraseña debe tener al menos 8 caracteres' };
    }
    if (!/[A-Z]/.test(password)) {
        return { valid: false, message: 'La contraseña debe tener al menos una mayúscula' };
    }
    if (!/[a-z]/.test(password)) {
        return { valid: false, message: 'La contraseña debe tener al menos una minúscula' };
    }
    if (!/[0-9]/.test(password)) {
        return { valid: false, message: 'La contraseña debe tener al menos un número' };
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        return { valid: false, message: 'La contraseña debe tener al menos un carácter especial' };
    }
    return { valid: true };
};

const validateName = (name, fieldName) => {
    if (!name || typeof name !== 'string') {
        return { valid: false, message: `El ${fieldName} es requerido` };
    }
    if (name.trim().length === 0) {
        return { valid: false, message: `El ${fieldName} no puede estar vacío` };
    }
    if (name.length > 30) {
        return { valid: false, message: `El ${fieldName} no puede tener más de 30 caracteres` };
    }
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(name)) {
        return { valid: false, message: `El ${fieldName} solo puede contener letras y espacios` };
    }
    return { valid: true };
};

router.post('/register', async (req, res) => {
    try {
        const body = req.body;

        if(body == null || typeof body !==  'object'){
            return res.status(400).json({
                message: 'Cuerpo de la peticion vacio.'
            })
        }

        const {email, password, name, lastname} = body;

        // Validaciones
        const emailValidation = validateEmail(email);
        if (!emailValidation.valid) {
            return res.status(400).json({ message: emailValidation.message });
        }

        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
            return res.status(400).json({ message: passwordValidation.message });
        }

        const nameValidation = validateName(name, 'nombre');
        if (!nameValidation.valid) {
            return res.status(400).json({ message: nameValidation.message });
        }

        const lastnameValidation = validateName(lastname, 'apellido');
        if (!lastnameValidation.valid) {
            return res.status(400).json({ message: lastnameValidation.message });
        }

        // Verificar si el email ya existe
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ message: 'El email ya está registrado' });
        }

        const user = await User.create({
            email: email.toLowerCase(),
            password,
            name: name.trim(),
            lastname: lastname.trim()
        });
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

        res.status(201).json({
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                lastname: user.lastname,
                favorites: [],
            }
        })
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Error al crear el usuario.'
        })
    }
});

router.post('/login', async (req, res) => {
    try {
        const body = req.body;

        if(body == null || typeof body !==  'object'){
            return res.status(400).json({
                message: 'Cuerpo de la peticion vacio.'
            })
        }

        const {email, password} = body;
        const user = await User.findOne({email: email.toLowerCase()})

        if(!user){
            return res.status(401).json({
                message: 'Credenciales invalidas.'
            })
        }

        const isPasswordValid = await user.comparePassword(password);
        if(!isPasswordValid){
            return res.status(401).json({
                message: 'Credenciales invalidas.'
            })
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

        res.status(200).json({
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                lastname: user.lastname,
                favorites: [],
            }
        })
    } catch (err) {
        console.error('Error en login:', err);
        res.status(500).json({
            message: 'Error al iniciar sesión.',
            error: err.message
        })
    }
});

// PUT /profile -> Update user
router.put('/profile', authenticateToken, async (req, res) => {
    try {
        const body = req.body;
        if(body == null || typeof body !==  'object'){
            return res.status(400).json({
                message: 'Cuerpo de la peticion vacio.'
            })
        }

        const {name, lastname, email, picture, password} = body;

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        if (email) {
            const emailValidation = validateEmail(email);
            if (!emailValidation.valid) {
                return res.status(400).json({ message: emailValidation.message });
            }
            const existingUser = await User.findOne({ 
                email: email.toLowerCase(),
                _id: { $ne: req.user.id }
            });
            if (existingUser) {
                return res.status(400).json({ message: 'El email ya está registrado' });
            }
            user.email = email.toLowerCase();
        }

        if (password) {
            const passwordValidation = validatePassword(password);
            if (!passwordValidation.valid) {
                return res.status(400).json({ message: passwordValidation.message });
            }
            user.password = password;
        }

        if (name) {
            const nameValidation = validateName(name, 'nombre');
            if (!nameValidation.valid) {
                return res.status(400).json({ message: nameValidation.message });
            }
            user.name = name.trim();
        }

        if (lastname) {
            const lastnameValidation = validateName(lastname, 'apellido');
            if (!lastnameValidation.valid) {
                return res.status(400).json({ message: lastnameValidation.message });
            }
            user.lastname = lastname.trim();
        }

        if (picture) {
            user.picture = picture;
        }

        await user.save();
        
        res.status(200).json({
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                lastname: user.lastname,
                picture: user.picture
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Error al actualizar el usuario.'
        })
    }
});

// PUT /favorites -> Update user favorites
router.put('/favorites', authenticateToken, async (req, res) => {
    try {
        const body = req.body;
        if(body == null || typeof body !==  'object'){
            return res.status(400).json({
                message: 'Cuerpo de la peticion vacio.'
            })
        }

        const {favorite_id} = body;

        if(typeof(favorite_id) !== 'number') {
            return res.status(400).json({
                message: 'El ID del favorito debe ser un número.'
            })
        }

        const user = await User.findById(req.user.id);

        if(user.favorites.includes(favorite_id)) {
            user.favorites = user.favorites.filter(id => id !== favorite_id).sort();
        } else {
            user.favorites.push(favorite_id);
            user.favorites.sort();
        }

        await user.save();

        res.status(200).json({
            favorites: user.favorites
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Error al actualizar favoritos'
        })
    }
});

export default router;