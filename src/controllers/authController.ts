import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import User from '../user'

export const register = async (req: Request, res: Response) => {
    const { username, email, password } = req.body
    const hashed = await bcrypt.hash(password, 10)
    const user = await User.create({ username, email, password: hashed })
    res.status(201).json({ message: 'User created', userId: user.id })
}

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body
    const user = await User.findOne({ where: { email } })
    if (!user) return res.status(404).json({ message: 'User not found' })

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return res.status(401).json({ message: 'Wrong password' })

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, {
        expiresIn: '1d'
    })
    res.json({ token })
}
