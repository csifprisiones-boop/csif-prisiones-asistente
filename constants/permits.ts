export interface Permit {
    label: string;
    detail: string;
    category: 'funcionario' | 'laboral';
}

export const PERMITS_DATA: Record<'funcionario' | 'laboral', { label: string; detail: string }[]> = {
    funcionario: [
        { label: 'Accidente/Enfermedad grave familiar (1er grado)', detail: '5 días hábiles. Incluye hospitalización o intervención sin hospitalización que precise reposo domiciliario.' },
        { label: 'Accidente/Enfermedad grave familiar (2º grado)', detail: '4 días hábiles. Incluye hospitalización o intervención sin hospitalización que precise reposo domiciliario.' },
        { label: 'Fallecimiento familiar (1er grado)', detail: '3 días hábiles si es en la misma localidad y 5 días hábiles si es en distinta localidad.' },
        { label: 'Fallecimiento familiar (2º grado)', detail: '2 días hábiles si es en la misma localidad y 4 días hábiles si es en distinta localidad.' },
        { label: 'Traslado de domicilio (sin cambio residencia)', detail: '1 día.' },
        { label: 'Exámenes finales y pruebas de aptitud', detail: 'Durante los días de su celebración.' },
        { label: 'Exámenes prenatales y técnicas preparación parto', detail: 'Tiempo indispensable para su realización.' },
        { label: 'Lactancia de hijo menor de 12 meses', detail: '1 hora de ausencia, o reducción de 30 min al inicio y final, o 1 hora al inicio o final. Acumulable en 4 semanas completas.' },
        { label: 'Hijos prematuros o hospitalizados tras parto', detail: '2 horas diarias de ausencia retribuida. Derecho a reducir jornada hasta 2 horas más con disminución de sueldo.' },
        { label: 'Guarda legal (menor 12 años/mayor/discapacidad)', detail: 'Reducción de jornada con disminución proporcional de retribuciones.' },
        { label: 'Cuidado familiar 1er grado (enfermedad muy grave)', detail: 'Reducción de hasta el 50% de la jornada, con carácter retribuido, máximo 1 mes.' },
        { label: 'Deber inexcusable público o personal', detail: 'Tiempo indispensable para su cumplimiento.' },
        { label: 'Asuntos particulares (Moscosos)', detail: '6 días al año.' },
        { label: 'Matrimonio o registro pareja de hecho', detail: '15 días naturales.' },
        { label: 'Vacaciones anuales', detail: '22 días hábiles. 23 días con 15 años, 24 días con 20 años, 25 con 25 años y 26 con 30 años o más.' },
        { label: 'Días por antigüedad (Canosos)', detail: '6 días (17 años), 8 (18 años), 9 (24), 10 (27), 11 (30), 12 (33), 13 (36), 14 (39), 15 (42), +1 cada 3 años extra.' },
        { label: 'Nacimiento, adopción o acogimiento', detail: '16 semanas ampliables (19 semanas para familias monoparentales).' },
        { label: 'Cuidado de hijo menor con cáncer/enfermedad grave', detail: 'Reducción jornada al menos 50% con retribución íntegra hasta los 23 años (ampliable a 26).' }
    ],
    laboral: [
        { label: 'Accidente/Enfermedad grave familiar (hasta 2º grado)', detail: '5 días. Por accidente, enfermedad grave, hospitalización o intervención sin hospitalización que precise reposo.' },
        { label: 'Fallecimiento familiar (1er grado)', detail: '3 días en misma localidad, 5 días en distinta localidad.' },
        { label: 'Fallecimiento familiar (2º grado)', detail: '2 días en misma localidad, 4 días en distinta localidad.' },
        { label: 'Traslado de domicilio', detail: '1 día en misma localidad, 2 días en distinta localidad.' },
        { label: 'Exámenes finales y de aptitud', detail: 'Tiempo indispensable para su celebración y desplazamiento.' },
        { label: 'Lactancia de hijo menor de 12 meses', detail: '1 hora de ausencia, reducible en media hora al inicio y final, o 1 hora al inicio o fin. Acumulable.' },
        { label: 'Hijos prematuros o hospitalizados', detail: '2 horas diarias de ausencia. Reducción jornada hasta 2 horas más con disminución retribuciones.' },
        { label: 'Guarda legal', detail: 'Reducción de jornada con disminución proporcional de retribuciones. Flexibilidad de 1 hora.' },
        { label: 'Asuntos particulares', detail: '6 días.' },
        { label: 'Matrimonio o pareja de hecho', detail: '15 días.' },
        { label: 'Licencia por estudios relacionados', detail: 'Periodo que coincida con el horario laboral (derecho al sueldo).' },
        { label: 'Asuntos propios (sin sueldo)', detail: 'Tres meses cada dos años.' },
        { label: 'Formación y perfeccionamiento profesional', detail: 'Hasta tres meses al año no retribuidos, previo informe favorable.' },
        { label: 'Vacaciones', detail: 'Similar a funcionarios: 22 días base, hasta 26 según antigüedad.' }
    ]
};
