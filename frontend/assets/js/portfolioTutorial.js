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
                    element: '.portfolio-config',
                    title: 'Configuración Inicial',
                    intro: `Primero debes configurar los parámetros básicos de tu cartera:`
                },
                {
                    element: '.validation-item:nth-child(1)',
                    title: 'Moneda de la Cartera',
                    intro: `Selecciona la moneda en la que deseas trabajar. Una cartera solo puede contener 
                           documentos de una misma moneda.`
                },
                {
                    element: '.validation-item:nth-child(2)',
                    title: 'Banco para Descuento',
                    intro: `Elige el banco que financiará tu cartera. Solo se mostrarán bancos que 
                           acepten la moneda seleccionada.`
                },
                {
                    element: '.validation-item:nth-child(3)',
                    title: 'Tipo de Documentos',
                    intro: `Define qué tipo de documentos incluirás en la cartera.`
                },
                {
                    element: '.continue-button',
                    title: 'Continuar',
                    intro: `Una vez configurada la cartera, haz clic aquí para ver los documentos disponibles 
                           según tus criterios.`
                },
                {
                    element: '.date-selection',
                    title: 'Fecha de Descuento',
                    intro: `Selecciona la fecha en la que necesitas el dinero. Esta fecha debe ser posterior 
                           a la emisión del documento y anterior a su vencimiento.`
                },
                {
                    element: '.documents-selection',
                    title: 'Selección de Documentos',
                    intro: `Aquí verás todos los documentos que cumplen con los criterios seleccionados.`
                },
                {
                    element: '.calculation-method-section',
                    title: 'Método de Cálculo',
                    intro: `Elige cómo quieres calcular el descuento:<br><br>
                           <b>• Valor Futuro al Vencimiento:</b> Usa el valor final del documento<br>
                           <b>• Monto Original:</b> Usa el valor inicial del documento<br>
                           <b>• Valor Futuro a Fecha:</b> Usa el valor del documento a la fecha seleccionada`
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