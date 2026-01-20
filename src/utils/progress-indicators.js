// Progress Indicators System
export class ProgressIndicatorManager {
    constructor() {
        this.progressBars = new Map();
        this.spinners = new Map();
        this.steps = new Map();
        this.defaultConfig = {
            size: 'medium',
            color: 'primary',
            showPercentage: true,
            showLabel: false,
            animated: true,
            striped: false,
            indeterminate: false,
            min: 0,
            max: 100,
            value: 0
        };
        this.init();
    }

    init() {
        this.setupGlobalStyles();
        this.setupEventListeners();
    }

    setupGlobalStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Progress bar base styles */
            .progress {
                display: flex;
                height: 1rem;
                overflow: hidden;
                font-size: 0.75rem;
                background-color: var(--muted, #e9ecef);
                border-radius: var(--radius, 0.25rem);
                position: relative;
            }

            .progress.small {
                height: 0.5rem;
            }

            .progress.large {
                height: 1.5rem;
            }

            .progress.xlarge {
                height: 2rem;
            }

            .progress-bar {
                display: flex;
                flex-direction: column;
                justify-content: center;
                color: var(--progress-color, #fff);
                text-align: center;
                white-space: nowrap;
                background-color: var(--primary, #007bff);
                transition: width 0.6s ease;
                position: relative;
                overflow: hidden;
            }

            .progress-bar.animated {
                background-image: linear-gradient(
                    45deg,
                    rgba(255, 255, 255, 0.15) 25%,
                    transparent 25%,
                    transparent 50%,
                    rgba(255, 255, 255, 0.15) 50%,
                    rgba(255, 255, 255, 0.15) 75%,
                    transparent 75%,
                    transparent
                );
                background-size: 1rem 1rem;
                animation: progress-bar-stripes 1s linear infinite;
            }

            .progress-bar.striped {
                background-image: linear-gradient(
                    45deg,
                    rgba(255, 255, 255, 0.15) 25%,
                    transparent 25%,
                    transparent 50%,
                    rgba(255, 255, 255, 0.15) 50%,
                    rgba(255, 255, 255, 0.15) 75%,
                    transparent 75%,
                    transparent
                );
                background-size: 1rem 1rem;
            }

            .progress-bar.indeterminate {
                animation: progress-indeterminate 1.5s ease-in-out infinite;
                background: linear-gradient(
                    to right,
                    var(--primary, #007bff) 0%,
                    var(--primary, #007bff) 30%,
                    var(--primary-light, #5cb85c) 30%,
                    var(--primary-light, #5cb85c) 70%,
                    var(--primary, #007bff) 70%,
                    var(--primary, #007bff) 100%
                );
                background-size: 200% 100%;
            }

            @keyframes progress-bar-stripes {
                0% {
                    background-position: 1rem 0;
                }
                100% {
                    background-position: 0 0;
                }
            }

            @keyframes progress-indeterminate {
                0% {
                    background-position: -200% 0;
                }
                100% {
                    background-position: 200% 0;
                }
            }

            /* Progress bar colors */
            .progress-bar.primary {
                background-color: var(--primary, #007bff);
                --progress-color: #fff;
            }

            .progress-bar.secondary {
                background-color: var(--secondary, #6c757d);
                --progress-color: #fff;
            }

            .progress-bar.success {
                background-color: var(--success, #28a745);
                --progress-color: #fff;
            }

            .progress-bar.danger {
                background-color: var(--destructive, #dc3545);
                --progress-color: #fff;
            }

            .progress-bar.warning {
                background-color: var(--warning, #ffc107);
                --progress-color: #212529;
            }

            .progress-bar.info {
                background-color: var(--info, #17a2b8);
                --progress-color: #fff;
            }

            .progress-bar.light {
                background-color: var(--light, #f8f9fa);
                --progress-color: #212529;
            }

            .progress-bar.dark {
                background-color: var(--dark, #343a40);
                --progress-color: #fff;
            }

            /* Progress with label */
            .progress-with-label {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
            }

            .progress-label {
                font-size: 0.875rem;
                font-weight: 500;
                color: var(--foreground, #495057);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .progress-label-text {
                flex: 1;
            }

            .progress-label-value {
                font-weight: 600;
                color: var(--primary, #007bff);
            }

            /* Circular progress */
            .progress-circle {
                position: relative;
                display: inline-block;
                width: 120px;
                height: 120px;
            }

            .progress-circle.small {
                width: 80px;
                height: 80px;
            }

            .progress-circle.large {
                width: 160px;
                height: 160px;
            }

            .progress-circle.xlarge {
                width: 200px;
                height: 200px;
            }

            .progress-circle svg {
                transform: rotate(-90deg);
                width: 100%;
                height: 100%;
            }

            .progress-circle-bg {
                fill: none;
                stroke: var(--muted, #e9ecef);
                stroke-width: 8;
            }

            .progress-circle-bar {
                fill: none;
                stroke: var(--primary, #007bff);
                stroke-width: 8;
                stroke-linecap: round;
                transition: stroke-dashoffset 0.6s ease;
            }

            .progress-circle-text {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 1.25rem;
                font-weight: 600;
                color: var(--foreground, #495057);
            }

            .progress-circle.small .progress-circle-text {
                font-size: 1rem;
            }

            .progress-circle.large .progress-circle-text {
                font-size: 1.5rem;
            }

            .progress-circle.xlarge .progress-circle-text {
                font-size: 1.75rem;
            }

            /* Step progress */
            .progress-steps {
                display: flex;
                align-items: center;
                justify-content: space-between;
                position: relative;
                margin: 2rem 0;
            }

            .progress-steps::before {
                content: '';
                position: absolute;
                top: 50%;
                left: 0;
                right: 0;
                height: 2px;
                background: var(--muted, #e9ecef);
                z-index: 0;
            }

            .progress-step {
                position: relative;
                z-index: 1;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 0.5rem;
            }

            .progress-step-circle {
                width: 2rem;
                height: 2rem;
                border-radius: 50%;
                background: var(--muted, #e9ecef);
                border: 2px solid var(--muted, #e9ecef);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.875rem;
                font-weight: 600;
                color: var(--muted-foreground, #6c757d);
                transition: all 0.3s ease;
            }

            .progress-step.active .progress-step-circle {
                background: var(--primary, #007bff);
                border-color: var(--primary, #007bff);
                color: var(--primary-foreground, #fff);
                transform: scale(1.1);
            }

            .progress-step.completed .progress-step-circle {
                background: var(--success, #28a745);
                border-color: var(--success, #28a745);
                color: var(--success-foreground, #fff);
            }

            .progress-step-label {
                font-size: 0.875rem;
                font-weight: 500;
                color: var(--muted-foreground, #6c757d);
                text-align: center;
                max-width: 100px;
            }

            .progress-step.active .progress-step-label {
                color: var(--primary, #007bff);
                font-weight: 600;
            }

            .progress-step.completed .progress-step-label {
                color: var(--success, #28a745);
            }

            /* Spinner styles */
            .spinner {
                display: inline-block;
                width: 2rem;
                height: 2rem;
                border: 0.25rem solid var(--muted, #e9ecef);
                border-radius: 50%;
                border-top-color: var(--primary, #007bff);
                animation: spinner 1s linear infinite;
            }

            .spinner.small {
                width: 1rem;
                height: 1rem;
                border-width: 0.125rem;
            }

            .spinner.large {
                width: 3rem;
                height: 3rem;
                border-width: 0.375rem;
            }

            .spinner.xlarge {
                width: 4rem;
                height: 4rem;
                border-width: 0.5rem;
            }

            @keyframes spinner {
                to {
                    transform: rotate(360deg);
                }
            }

            /* Spinner colors */
            .spinner.primary {
                border-top-color: var(--primary, #007bff);
            }

            .spinner.secondary {
                border-top-color: var(--secondary, #6c757d);
            }

            .spinner.success {
                border-top-color: var(--success, #28a745);
            }

            .spinner.danger {
                border-top-color: var(--destructive, #dc3545);
            }

            .spinner.warning {
                border-top-color: var(--warning, #ffc107);
            }

            .spinner.info {
                border-top-color: var(--info, #17a2b8);
            }

            /* Dots spinner */
            .spinner-dots {
                display: inline-flex;
                gap: 0.25rem;
            }

            .spinner-dots .dot {
                width: 0.5rem;
                height: 0.5rem;
                border-radius: 50%;
                background: var(--primary, #007bff);
                animation: spinner-dots 1.4s ease-in-out infinite both;
            }

            .spinner-dots .dot:nth-child(1) {
                animation-delay: -0.32s;
            }

            .spinner-dots .dot:nth-child(2) {
                animation-delay: -0.16s;
            }

            @keyframes spinner-dots {
                0%, 80%, 100% {
                    transform: scale(0);
                    opacity: 0.5;
                }
                40% {
                    transform: scale(1);
                    opacity: 1;
                }
            }

            /* Pulse spinner */
            .spinner-pulse {
                display: inline-block;
                width: 2rem;
                height: 2rem;
                background: var(--primary, #007bff);
                border-radius: 50%;
                animation: spinner-pulse 1.5s ease-in-out infinite;
            }

            .spinner-pulse.small {
                width: 1rem;
                height: 1rem;
            }

            .spinner-pulse.large {
                width: 3rem;
                height: 3rem;
            }

            @keyframes spinner-pulse {
                0% {
                    transform: scale(0);
                    opacity: 1;
                }
                100% {
                    transform: scale(1);
                    opacity: 0;
                }
            }

            /* Progress container */
            .progress-container {
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }

            .progress-container.horizontal {
                flex-direction: row;
                align-items: center;
                gap: 1rem;
            }

            .progress-container.horizontal .progress {
                flex: 1;
            }

            /* Progress with icon */
            .progress-with-icon {
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .progress-icon {
                font-size: 1rem;
                color: var(--primary, #007bff);
            }

            /* Progress group */
            .progress-group {
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }

            .progress-group-item {
                display: flex;
                flex-direction: column;
                gap: 0.25rem;
            }

            .progress-group-label {
                font-size: 0.875rem;
                font-weight: 500;
                color: var(--foreground, #495057);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            /* Dark mode support */
            .dark .progress {
                background-color: var(--muted, #374151);
            }

            .dark .progress-label {
                color: var(--foreground, #f3f4f6);
            }

            .dark .progress-label-value {
                color: var(--primary, #3b82f6);
            }

            .dark .progress-circle-bg {
                stroke: var(--muted, #4b5563);
            }

            .dark .progress-circle-text {
                color: var(--foreground, #f3f4f6);
            }

            .dark .progress-steps::before {
                background: var(--muted, #4b5563);
            }

            .dark .progress-step-circle {
                background: var(--muted, #4b5563);
                border-color: var(--muted, #4b5563);
                color: var(--muted-foreground, #9ca3af);
            }

            .dark .progress-step-label {
                color: var(--muted-foreground, #9ca3af);
            }

            .dark .spinner {
                border-color: var(--muted, #4b5563);
            }

            /* Reduced motion support */
            @media (prefers-reduced-motion: reduce) {
                .progress-bar,
                .progress-circle-bar,
                .spinner,
                .spinner-dots .dot,
                .spinner-pulse,
                .progress-step-circle {
                    animation: none;
                    transition: none;
                }
            }

            /* Accessibility */
            .progress[role="progressbar"] {
                outline: none;
            }

            .progress[role="progressbar"]:focus {
                outline: 2px solid var(--primary, #007bff);
                outline-offset: 2px;
            }

            /* Performance optimizations */
            .progress,
            .progress-circle,
            .spinner {
                will-change: transform;
                contain: layout style paint;
            }

            /* Responsive design */
            @media (max-width: 768px) {
                .progress-steps {
                    flex-direction: column;
                    gap: 1rem;
                }

                .progress-steps::before {
                    top: 0;
                    left: 50%;
                    bottom: auto;
                    right: auto;
                    width: 2px;
                    height: 100%;
                    transform: translateX(-50%);
                }

                .progress-step {
                    flex-direction: row;
                    gap: 1rem;
                    width: 100%;
                }

                .progress-step-label {
                    text-align: left;
                    max-width: none;
                }

                .progress-container.horizontal {
                    flex-direction: column;
                    align-items: stretch;
                }

                .progress-container.horizontal .progress {
                    width: 100%;
                }
            }
        `;
        document.head.appendChild(style);
    }

    setupEventListeners() {
        // Listen for progress requests
        document.addEventListener('createProgressBar', (e) => {
            this.handleCreateProgressBar(e.detail);
        });

        document.addEventListener('updateProgress', (e) => {
            this.handleUpdateProgress(e.detail);
        });

        document.addEventListener('createSpinner', (e) => {
            this.handleCreateSpinner(e.detail);
        });

        document.addEventListener('createStepProgress', (e) => {
            this.handleCreateStepProgress(e.detail);
        });

        document.addEventListener('createCircularProgress', (e) => {
            this.handleCreateCircularProgress(e.detail);
        });
    }

    // Progress bar creation
    createProgressBar(container, config = {}) {
        const progressConfig = { ...this.defaultConfig, ...config };
        const progressId = this.generateId();
        
        // Create progress container
        const progressContainer = document.createElement('div');
        progressContainer.className = 'progress-container';
        progressContainer.setAttribute('data-progress-id', progressId);
        
        // Add label if enabled
        if (progressConfig.showLabel) {
            const labelContainer = document.createElement('div');
            labelContainer.className = 'progress-label';
            labelContainer.innerHTML = `
                <span class="progress-label-text">${progressConfig.label || 'Progress'}</span>
                <span class="progress-label-value">${progressConfig.value}%</span>
            `;
            progressContainer.appendChild(labelContainer);
        }
        
        // Create progress bar
        const progressBar = document.createElement('div');
        progressBar.className = `progress ${progressConfig.size}`;
        progressBar.setAttribute('role', 'progressbar');
        progressBar.setAttribute('aria-valuenow', progressConfig.value);
        progressBar.setAttribute('aria-valuemin', progressConfig.min);
        progressBar.setAttribute('aria-valuemax', progressConfig.max);
        progressBar.setAttribute('aria-label', progressConfig.label || 'Progress');
        
        // Create progress bar fill
        const progressFill = document.createElement('div');
        progressFill.className = `progress-bar ${progressConfig.color}`;
        
        if (progressConfig.animated) {
            progressFill.classList.add('animated');
        }
        
        if (progressConfig.striped) {
            progressFill.classList.add('striped');
        }
        
        if (progressConfig.indeterminate) {
            progressFill.classList.add('indeterminate');
            progressFill.style.width = '100%';
        } else {
            const percentage = ((progressConfig.value - progressConfig.min) / (progressConfig.max - progressConfig.min)) * 100;
            progressFill.style.width = `${percentage}%`;
            
            if (progressConfig.showPercentage) {
                progressFill.textContent = `${Math.round(percentage)}%`;
            }
        }
        
        progressBar.appendChild(progressFill);
        progressContainer.appendChild(progressBar);
        
        // Add to container
        container.appendChild(progressContainer);
        
        // Track progress bar
        this.progressBars.set(progressId, {
            id: progressId,
            container: progressContainer,
            progressBar: progressBar,
            progressFill: progressFill,
            config: progressConfig
        });
        
        // Emit event
        this.emitProgressEvent('progressBarCreated', {
            progressId,
            element: progressContainer,
            config: progressConfig,
            timestamp: Date.now()
        });
        
        return progressId;
    }

    // Update progress
    updateProgress(progressId, value, config = {}) {
        const progressBar = this.progressBars.get(progressId);
        
        if (!progressBar) {
            console.warn('Progress bar not found:', progressId);
            return;
        }

        // Update config
        progressBar.config = { ...progressBar.config, ...config };
        const progressConfig = progressBar.config;
        
        // Update value
        progressConfig.value = Math.max(progressConfig.min, Math.min(progressConfig.max, value));
        
        // Calculate percentage
        const percentage = ((progressConfig.value - progressConfig.min) / (progressConfig.max - progressConfig.min)) * 100;
        
        // Update progress fill
        if (!progressConfig.indeterminate) {
            progressBar.progressFill.style.width = `${percentage}%`;
            
            if (progressConfig.showPercentage) {
                progressBar.progressFill.textContent = `${Math.round(percentage)}%`;
            }
        }
        
        // Update aria attributes
        progressBar.progressBar.setAttribute('aria-valuenow', progressConfig.value);
        
        // Update label
        const labelValue = progressContainer.querySelector('.progress-label-value');
        if (labelValue) {
            labelValue.textContent = `${Math.round(percentage)}%`;
        }
        
        // Update color
        progressBar.progressFill.className = `progress-bar ${progressConfig.color}`;
        
        if (progressConfig.animated) {
            progressBar.progressFill.classList.add('animated');
        }
        
        if (progressConfig.striped) {
            progressBar.progressFill.classList.add('striped');
        }
        
        if (progressConfig.indeterminate) {
            progressBar.progressFill.classList.add('indeterminate');
        }
        
        // Emit event
        this.emitProgressEvent('progressUpdated', {
            progressId,
            value: progressConfig.value,
            percentage,
            timestamp: Date.now()
        });
        
        return progressBar;
    }

    // Circular progress
    createCircularProgress(container, config = {}) {
        const progressConfig = { ...this.defaultConfig, ...config };
        const progressId = this.generateId();
        
        // Create circular progress container
        const circleContainer = document.createElement('div');
        circleContainer.className = `progress-circle ${progressConfig.size}`;
        circleContainer.setAttribute('data-progress-id', progressId);
        
        // Calculate circle dimensions
        const size = this.getCircleSize(progressConfig.size);
        const radius = (size - 16) / 2; // 16px for stroke width
        const circumference = 2 * Math.PI * radius;
        
        // Calculate percentage
        const percentage = ((progressConfig.value - progressConfig.min) / (progressConfig.max - progressConfig.min)) * 100;
        const offset = circumference - (percentage / 100) * circumference;
        
        // Create SVG
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
        
        // Create background circle
        const bgCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        bgCircle.setAttribute('cx', size / 2);
        bgCircle.setAttribute('cy', size / 2);
        bgCircle.setAttribute('r', radius);
        bgCircle.classList.add('progress-circle-bg');
        
        // Create progress circle
        const progressCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        progressCircle.setAttribute('cx', size / 2);
        progressCircle.setAttribute('cy', size / 2);
        progressCircle.setAttribute('r', radius);
        progressCircle.classList.add('progress-circle-bar');
        progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
        progressCircle.style.strokeDashoffset = offset;
        progressCircle.style.stroke = this.getColor(progressConfig.color);
        
        // Add circles to SVG
        svg.appendChild(bgCircle);
        svg.appendChild(progressCircle);
        
        // Create text
        const text = document.createElement('div');
        text.className = 'progress-circle-text';
        text.textContent = `${Math.round(percentage)}%`;
        
        // Add to container
        circleContainer.appendChild(svg);
        circleContainer.appendChild(text);
        
        // Add to container
        container.appendChild(circleContainer);
        
        // Track circular progress
        this.progressBars.set(progressId, {
            id: progressId,
            container: circleContainer,
            svg: svg,
            progressCircle: progressCircle,
            text: text,
            circumference: circumference,
            config: progressConfig
        });
        
        // Emit event
        this.emitProgressEvent('circularProgressCreated', {
            progressId,
            element: circleContainer,
            config: progressConfig,
            timestamp: Date.now()
        });
        
        return progressId;
    }

    // Step progress
    createStepProgress(container, steps, config = {}) {
        const progressConfig = { ...this.defaultConfig, ...config };
        const progressId = this.generateId();
        
        // Create steps container
        const stepsContainer = document.createElement('div');
        stepsContainer.className = 'progress-steps';
        stepsContainer.setAttribute('data-progress-id', progressId);
        
        // Create step elements
        const stepElements = [];
        steps.forEach((step, index) => {
            const stepElement = document.createElement('div');
            stepElement.className = 'progress-step';
            stepElement.setAttribute('data-step-index', index);
            
            // Create step circle
            const circle = document.createElement('div');
            circle.className = 'progress-step-circle';
            
            // Add step number or checkmark
            if (index < progressConfig.value) {
                circle.innerHTML = '✓';
                stepElement.classList.add('completed');
            } else if (index === progressConfig.value) {
                circle.textContent = index + 1;
                stepElement.classList.add('active');
            } else {
                circle.textContent = index + 1;
            }
            
            // Create step label
            const label = document.createElement('div');
            label.className = 'progress-step-label';
            label.textContent = step.label || `Step ${index + 1}`;
            
            // Add to step element
            stepElement.appendChild(circle);
            stepElement.appendChild(label);
            stepsContainer.appendChild(stepElement);
            stepElements.push(stepElement);
        });
        
        // Add to container
        container.appendChild(stepsContainer);
        
        // Track step progress
        this.steps.set(progressId, {
            id: progressId,
            container: stepsContainer,
            steps: stepElements,
            config: progressConfig,
            totalSteps: steps.length
        });
        
        // Emit event
        this.emitProgressEvent('stepProgressCreated', {
            progressId,
            element: stepsContainer,
            steps: steps.length,
            config: progressConfig,
            timestamp: Date.now()
        });
        
        return progressId;
    }

    // Spinner creation
    createSpinner(container, config = {}) {
        const spinnerConfig = { ...this.defaultConfig, ...config };
        const spinnerId = this.generateId();
        
        // Create spinner container
        const spinnerContainer = document.createElement('div');
        spinnerContainer.className = `spinner ${spinnerConfig.size} ${spinnerConfig.color}`;
        spinnerContainer.setAttribute('data-spinner-id', spinnerId);
        
        // Add to container
        container.appendChild(spinnerContainer);
        
        // Track spinner
        this.spinners.set(spinnerId, {
            id: spinnerId,
            container: spinnerContainer,
            config: spinnerConfig
        });
        
        // Emit event
        this.emitProgressEvent('spinnerCreated', {
            spinnerId,
            element: spinnerContainer,
            config: spinnerConfig,
            timestamp: Date.now()
        });
        
        return spinnerId;
    }

    // Dots spinner
    createDotsSpinner(container, config = {}) {
        const spinnerConfig = { ...this.defaultConfig, ...config };
        const spinnerId = this.generateId();
        
        // Create dots container
        const dotsContainer = document.createElement('div');
        dotsContainer.className = 'spinner-dots';
        dotsContainer.setAttribute('data-spinner-id', spinnerId);
        
        // Create dots
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.className = 'dot';
            dot.style.background = this.getColor(spinnerConfig.color);
            dotsContainer.appendChild(dot);
        }
        
        // Add to container
        container.appendChild(dotsContainer);
        
        // Track spinner
        this.spinners.set(spinnerId, {
            id: spinnerId,
            container: dotsContainer,
            config: spinnerConfig
        });
        
        return spinnerId;
    }

    // Pulse spinner
    createPulseSpinner(container, config = {}) {
        const spinnerConfig = { ...this.defaultConfig, ...config };
        const spinnerId = this.generateId();
        
        // Create pulse spinner
        const pulseSpinner = document.createElement('div');
        pulseSpinner.className = `spinner-pulse ${spinnerConfig.size}`;
        pulseSpinner.style.background = this.getColor(spinnerConfig.color);
        pulseSpinner.setAttribute('data-spinner-id', spinnerId);
        
        // Add to container
        container.appendChild(pulseSpinner);
        
        // Track spinner
        this.spinners.set(spinnerId, {
            id: spinnerId,
            container: pulseSpinner,
            config: spinnerConfig
        });
        
        return spinnerId;
    }

    // Update step progress
    updateStepProgress(progressId, currentStep) {
        const stepProgress = this.steps.get(progressId);
        
        if (!stepProgress) {
            console.warn('Step progress not found:', progressId);
            return;
        }

        // Update step states
        stepProgress.steps.forEach((step, index) => {
            const circle = step.querySelector('.progress-step-circle');
            
            // Remove all states
            step.classList.remove('active', 'completed');
            
            if (index < currentStep) {
                step.classList.add('completed');
                circle.innerHTML = '✓';
            } else if (index === currentStep) {
                step.classList.add('active');
                circle.textContent = index + 1;
            } else {
                circle.textContent = index + 1;
            }
        });
        
        // Update config
        stepProgress.config.value = currentStep;
        
        // Emit event
        this.emitProgressEvent('stepProgressUpdated', {
            progressId,
            currentStep,
            timestamp: Date.now()
        });
        
        return stepProgress;
    }

    // Remove progress indicators
    removeProgressBar(progressId) {
        const progressBar = this.progressBars.get(progressId);
        
        if (progressBar) {
            progressBar.container.remove();
            this.progressBars.delete(progressId);
            
            this.emitProgressEvent('progressBarRemoved', {
                progressId,
                timestamp: Date.now()
            });
        }
    }

    removeSpinner(spinnerId) {
        const spinner = this.spinners.get(spinnerId);
        
        if (spinner) {
            spinner.container.remove();
            this.spinners.delete(spinnerId);
            
            this.emitProgressEvent('spinnerRemoved', {
                spinnerId,
                timestamp: Date.now()
            });
        }
    }

    removeStepProgress(progressId) {
        const stepProgress = this.steps.get(progressId);
        
        if (stepProgress) {
            stepProgress.container.remove();
            this.steps.delete(progressId);
            
            this.emitProgressEvent('stepProgressRemoved', {
                progressId,
                timestamp: Date.now()
            });
        }
    }

    // Event handlers
    handleCreateProgressBar(detail) {
        const { container, config } = detail;
        this.createProgressBar(container, config);
    }

    handleUpdateProgress(detail) {
        const { progressId, value, config } = detail;
        this.updateProgress(progressId, value, config);
    }

    handleCreateSpinner(detail) {
        const { container, config } = detail;
        this.createSpinner(container, config);
    }

    handleCreateStepProgress(detail) {
        const { container, steps, config } = detail;
        this.createStepProgress(container, steps, config);
    }

    handleCreateCircularProgress(detail) {
        const { container, config } = detail;
        this.createCircularProgress(container, config);
    }

    // Utility methods
    getCircleSize(size) {
        const sizes = {
            'small': 80,
            'medium': 120,
            'large': 160,
            'xlarge': 200
        };
        return sizes[size] || sizes.medium;
    }

    getColor(color) {
        const colors = {
            'primary': 'var(--primary, #007bff)',
            'secondary': 'var(--secondary, #6c757d)',
            'success': 'var(--success, #28a745)',
            'danger': 'var(--destructive, #dc3545)',
            'warning': 'var(--warning, #ffc107)',
            'info': 'var(--info, #17a2b8)',
            'light': 'var(--light, #f8f9fa)',
            'dark': 'var(--dark, #343a40)'
        };
        return colors[color] || colors.primary;
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Event emission
    emitProgressEvent(type, data) {
        const event = new CustomEvent('progressIndicatorManager', {
            detail: {
                type: type,
                data: data,
                timestamp: Date.now()
            }
        });
        document.dispatchEvent(event);
    }

    // Public API methods
    getProgressBar(progressId) {
        return this.progressBars.get(progressId);
    }

    getSpinner(spinnerId) {
        return this.spinners.get(spinnerId);
    }

    getStepProgress(progressId) {
        return this.steps.get(progressId);
    }

    getAllProgressBars() {
        return Array.from(this.progressBars.values());
    }

    getAllSpinners() {
        return Array.from(this.spinners.values());
    }

    getAllStepProgress() {
        return Array.from(this.steps.values());
    }

    setDefaultConfig(config) {
        this.defaultConfig = { ...this.defaultConfig, ...config };
    }

    // Cleanup
    destroy() {
        // Remove all progress indicators
        this.progressBars.forEach((progress, id) => {
            this.removeProgressBar(id);
        });
        
        this.spinners.forEach((spinner, id) => {
            this.removeSpinner(id);
        });
        
        this.steps.forEach((step, id) => {
            this.removeStepProgress(id);
        });
        
        // Clear tracking
        this.progressBars.clear();
        this.spinners.clear();
        this.steps.clear();
    }
}

// Create singleton instance
export const progressIndicatorManager = new ProgressIndicatorManager();
