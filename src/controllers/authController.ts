import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import User from '../user'
import { AuthRequest } from '../middleware/authMiddleware'

export const register = async (req: Request, res: Response) => {
    try {
        const { username, email, password } = req.body

        if (!username || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' })
        }

        const existingUser = await User.findOne({ where: { email } })
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use' })
        }

        const hashed = await bcrypt.hash(password, 10)
        const user = await User.create({ username, email, password: hashed })

        res.status(201).json({
            message: 'User created',
            userId: user.id
        })
    } catch (error) {
        console.error('Register error:', error)
        res.status(500).json({ message: 'Could not register user' })
    }
}

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body

        const user = await User.findOne({ where: { email } })
        if (!user) return res.status(404).json({ message: 'User not found' })

        const valid = await bcrypt.compare(password, user.password)
        if (!valid) return res.status(401).json({ message: 'Wrong password' })

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, {
            expiresIn: '1d'
        })

        res.json({ token })
    } catch (error) {
        console.error('Login error:', error)
        res.status(500).json({ message: 'Could not log in' })
    }
}

export const getMe = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ message: 'Unauthorized' })
        }

        const user = await User.findByPk(req.userId, {
            attributes: ['id', 'username', 'email']
        })

        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        res.json(user)
    } catch (error) {
        console.error('Get me error:', error)
        res.status(500).json({ message: 'Could not fetch user data' })
    }
}
