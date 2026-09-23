import { Request, Response } from 'express';
import { pool } from '../../config/db';
import bcrypt from 'bcryptjs';

export const getUsuarios = async (req: Request, res: Response) => {
  try {
    const { rows } = await pool!.query('SELECT id, usuario, correo, rol, nombre_completo, estado, fecha_registro FROM usuarios ORDER BY fecha_registro DESC');
    return res.json({ ok: true, usuarios: rows });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return res.status(500).json({ ok: false, error: 'Error al obtener usuarios' });
  }
};

export const createUsuario = async (req: Request, res: Response) => {
  const { usuario, correo, contrasena, rol, nombre_completo, estado } = req.body;
  try {
    const hash = await bcrypt.hash(contrasena, 10);
    const { rows } = await pool!.query(
      `INSERT INTO usuarios (usuario, correo, password_hash, rol, nombre_completo, estado) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, usuario, correo, rol, nombre_completo, estado`,
      [usuario, correo.toLowerCase().trim(), hash, rol, nombre_completo, estado || 'ACTIVO']
    );
    return res.status(201).json({ ok: true, usuario: rows[0], mensaje: 'Usuario creado exitosamente' });
  } catch (error: any) {
    console.error('Error al crear usuario:', error);
    return res.status(500).json({ ok: false, error: 'Error al crear usuario. Verifica que el correo o usuario no existan.' });
  }
};

export const updateUsuario = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { usuario, correo, rol, nombre_completo, estado, contrasena } = req.body;
  
  try {
    let query = `UPDATE usuarios SET usuario = $1, correo = $2, rol = $3, nombre_completo = $4, estado = $5`;
    let params = [usuario, correo.toLowerCase().trim(), rol, nombre_completo, estado];
    let queryTail = ` WHERE id = $6 RETURNING id, usuario, correo, rol, nombre_completo, estado`;

    if (contrasena && contrasena.trim() !== '') {
      const hash = await bcrypt.hash(contrasena, 10);
      query += `, password_hash = $6`;
      params.push(hash);
      queryTail = ` WHERE id = $7 RETURNING id, usuario, correo, rol, nombre_completo, estado`;
    }

    params.push(id);
    const { rows } = await pool!.query(query + queryTail, params);

    if (rows.length === 0) {
      return res.status(404).json({ ok: false, error: 'Usuario no encontrado' });
    }

    return res.json({ ok: true, usuario: rows[0], mensaje: 'Usuario actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    return res.status(500).json({ ok: false, error: 'Error al actualizar usuario' });
  }
};

export const deleteUsuario = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const { rows } = await pool!.query(`UPDATE usuarios SET estado = 'INACTIVO' WHERE id = $1 RETURNING id`, [id]);
    if (rows.length === 0) {
      return res.status(404).json({ ok: false, error: 'Usuario no encontrado' });
    }
    return res.json({ ok: true, mensaje: 'Usuario inactivado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    return res.status(500).json({ ok: false, error: 'Error al eliminar usuario' });
  }
};
