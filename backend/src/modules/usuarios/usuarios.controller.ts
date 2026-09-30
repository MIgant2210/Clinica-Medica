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

    // Si el rol es MEDICO, vincularlo como profesional para que aparezca al agendar citas
    if (rol === 'MEDICO') {
      try {
        const partesNombre = (nombre_completo || 'Dr. Médico').trim().split(' ');
        const primerNombre = partesNombre[0] || 'Dr.';
        const primerApellido = partesNombre.slice(1).join(' ') || 'Médico';
        
        const perRes = await pool!.query(
          `INSERT INTO personas (tipo_documento, numero_documento, primer_nombre, primer_apellido, fecha_nacimiento, sexo, telefono, correo)
           VALUES ('DPI', $1, $2, $3, '1985-01-01', 'MASCULINO', '5500-0000', $4) RETURNING id`,
          ['DOC' + Math.floor(10000000 + Math.random() * 90000000), primerNombre, primerApellido, correo.toLowerCase().trim()]
        );
        const personaId = perRes.rows[0].id;

        const empRes = await pool!.query(
          `INSERT INTO empleados (persona_id, codigo_empleado, puesto)
           VALUES ($1, $2, 'Médico Especialista') RETURNING id`,
          [personaId, 'EMP-' + Math.floor(1000 + Math.random() * 9000)]
        );
        const empleadoId = empRes.rows[0].id;

        await pool!.query(
          `INSERT INTO profesionales (empleado_id, persona_id, nombre, numero_colegiado, especialidad)
           VALUES ($1, $2, $3, $4, 'Medicina General')`,
          [empleadoId, personaId, nombre_completo, 'COL-' + Math.floor(10000 + Math.random() * 90000)]
        );
      } catch (profErr) {
        console.error('Advertencia al crear registro de profesional para nuevo médico:', profErr);
      }
    }

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
