class TutorialManager {
    constructor() {
        this.intro = introJs();
        this.setupTutorials();
    }

    setupTutorials() {
        this.tutorials = {
            home: [
                {
                    element: '.home-section',
                    intro: '¡Bienvenido a tu panel principal!'
                },
                {
                    element: '.profile-section',
                    intro: 'Aquí puedes actualizar tu información personal'
                },
                {
                    element: '.quick-actions',
                    intro: 'Accede rápidamente a las principales funciones'
                }
            ],
            documents: [
                {
                    element: '#documentForm',
                    intro: 'Crea nuevos documentos financieros aquí'
                },
                {
                    element: '.document-filters',
                    intro: 'Filtra tus documentos por tipo o moneda'
                },
                {
                    element: '.table-container',
                    intro: 'Visualiza y gestiona todos tus documentos'
                }
            ],
            banks: [
                {
                    element: '#bankForm',
                    intro: 'Registra nuevos bancos y sus tasas de descuento'
                },
                {
                    element: '.table-container',
                    intro: 'Administra tus bancos registrados'
                }
            ],
            portfolio: [
                {
                    element: '.date-selection',
                    intro: 'Selecciona la fecha para el cálculo del descuento'
                },
                {
                    element: '.days-config-section',
                    intro: 'Configura el tipo de año para los cálculos'
                },
                {
                    element: '.documents-selection',
                    intro: 'Selecciona los documentos a incluir en la cartera'
                },
                {
                    element: '.calculation-method-section',
                    intro: 'Elige el método de cálculo que prefieras'
                },
                {
                    element: '.calculate-button',
                    intro: 'Calcula el valor de tu cartera'
                }
            ]
        };
    }

    startTutorial(section = 'home') {
        const steps = this.tutorials[section];
        if (!steps) return;

        this.intro.setOptions({
            steps: steps,
            showProgress: true,
            showBullets: true,
            showStepNumbers: true,
            nextLabel: 'Siguiente',
            prevLabel: 'Anterior',
            skipLabel: 'Salir',
            doneLabel: 'Finalizar'
        });

        this.intro.start();
    }

    addTutorialButtons() {
        const sections = ['documents', 'banks', 'portfolio'];
        sections.forEach(section => {
            const container = document.querySelector(`.${section}-section`);
            if (container) {
                const button = document.createElement('button');
                button.className = 'tutorial-button';
                button.textContent = 'Ver Tutorial';
                button.onclick = () => this.startTutorial(section);
                container.appendChild(button);
            }
        });
    }
}

const tutorialManager = new TutorialManager();