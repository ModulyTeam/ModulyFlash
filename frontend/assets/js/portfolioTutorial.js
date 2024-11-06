class PortfolioTutorial {
    static startTutorial() {
        const intro = introJs();
        
        intro.setOptions({
            steps: [
                {
                    title: 'Bienvenido a la Cartera de Descuento',
                    intro: `Esta herramienta te permite calcular el valor presente de tus documentos financieros 
                           cuando necesitas financiamiento antes de su fecha de vencimiento.`
                },
                {
                    element: '.portfolio-section',
                    title: 'Caso de Estudio',
                    intro: `Imagina que tienes facturas o letras por cobrar, pero necesitas el dinero antes 
                           del vencimiento. Esta calculadora te ayuda a determinar cuánto dinero podrías 
                           recibir hoy de un banco por estos documentos.`
                },
                {
                    element: '.date-selection',
                    title: 'Fecha de Descuento',
                    intro: `Selecciona la fecha en la que necesitas el dinero. Esta fecha debe ser posterior 
                           a la emisión del documento y anterior a su vencimiento.`
                },
                {
                    element: '.days-config-section',
                    title: 'Configuración del Año',
                    intro: `Puedes elegir entre año comercial (360 días) o calendario (365 días) para los cálculos. 
                           Los bancos suelen usar el año comercial de 360 días.`
                },
                {
                    element: '.documents-selection',
                    title: 'Selección de Documentos',
                    intro: `Aquí verás todos tus documentos financieros. Selecciona los que deseas descontar. 
                           Si un documento no tiene banco asignado, deberás ingresar una tasa de descuento manualmente.`
                },
                {
                    element: '.calculation-method-section',
                    title: 'Métodos de Cálculo',
                    intro: `<b>Valor Futuro al Vencimiento:</b> Calcula primero el valor futuro total y luego lo descuenta.<br><br>
                           <b>Monto Original:</b> Descuenta directamente el monto original.<br><br>
                           <b>Valor Futuro a Fecha:</b> Calcula el valor futuro hasta la fecha seleccionada y luego descuenta.`
                },
                {
                    element: '.calculate-button',
                    title: 'Calcular Descuento',
                    intro: 'Al calcular, verás los resultados separados por moneda y banco.'
                },
                {
                    element: '.results-container',
                    title: 'Resultados',
                    intro: `Los resultados muestran:<br>
                           - Tablas separadas por moneda<br>
                           - Valor original, futuro y descontado<br>
                           - Detalles del cálculo paso a paso<br>
                           - Recomendaciones de bancos si hay documentos sin banco asignado`
                },
                {
                    element: '.export-button',
                    title: 'Exportar Resultados',
                    intro: 'Puedes exportar todos los cálculos y resultados a un PDF detallado.'
                }
            ],
            showProgress: true,
            showBullets: true,
            showStepNumbers: true,
            nextLabel: 'Siguiente',
            prevLabel: 'Anterior',
            skipLabel: 'Salir',
            doneLabel: 'Finalizar',
            tooltipClass: 'portfolio-tutorial-tooltip'
        });

        intro.start();
    }
} 