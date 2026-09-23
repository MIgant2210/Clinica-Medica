import { useMemo } from 'react';

interface EdadExacta {
  anios: number;
  meses: number;
  dias: number;
}

interface ContextoClinico {
  edad: EdadExacta;
  esPediatrico: boolean;
  esMujer: boolean;
  edadFormateada: string;
}

const LIMITE_PEDIATRICO_ANIOS = 18; // Configurable globalmente

export const useContextoClinico = (
  fechaNacimiento?: string,
  sexo?: string
): ContextoClinico => {
  return useMemo(() => {
    let edad: EdadExacta = { anios: 0, meses: 0, dias: 0 };
    let esPediatrico = false;
    let esMujer = sexo?.toUpperCase() === 'FEMENINO';

    if (fechaNacimiento) {
      const fn = new Date(fechaNacimiento);
      const hoy = new Date();

      let anios = hoy.getFullYear() - fn.getFullYear();
      let meses = hoy.getMonth() - fn.getMonth();
      let dias = hoy.getDate() - fn.getDate();

      if (dias < 0) {
        meses -= 1;
        // Días del mes anterior
        const anteriorMes = new Date(hoy.getFullYear(), hoy.getMonth(), 0).getDate();
        dias += anteriorMes;
      }

      if (meses < 0) {
        anios -= 1;
        meses += 12;
      }

      edad = { anios, meses, dias };
      esPediatrico = anios < LIMITE_PEDIATRICO_ANIOS;
    }

    let edadFormateada = '';
    if (edad.anios > 0) {
      edadFormateada = `${edad.anios} años`;
      if (edad.anios < LIMITE_PEDIATRICO_ANIOS && edad.meses > 0) {
        edadFormateada += `, ${edad.meses} meses`;
      }
    } else if (edad.meses > 0) {
      edadFormateada = `${edad.meses} meses`;
      if (edad.dias > 0) {
        edadFormateada += `, ${edad.dias} días`;
      }
    } else {
      edadFormateada = `${edad.dias} días`;
    }

    return {
      edad,
      esPediatrico,
      esMujer,
      edadFormateada,
    };
  }, [fechaNacimiento, sexo]);
};
