import { ReactNode } from 'react';
import { Check } from 'lucide-react';

interface Step {
    title: string;
    description?: string;
}

interface FormWizardProps {
    steps: Step[];
    currentStep: number;
    children: ReactNode;
}

export default function FormWizard({ steps, currentStep, children }: FormWizardProps) {
    return (
        <div>
            {/* Step Indicator */}
            <div className="mb-8">
                <div className="flex items-center justify-center">
                    {steps.map((step, index) => (
                        <div key={index} className="flex items-center">
                            {/* Step Circle */}
                            <div className="flex flex-col items-center">
                                <div
                                    className={`
                                        w-10 h-10 rounded-full flex items-center justify-center
                                        font-semibold text-sm transition-colors
                                        ${index < currentStep
                                            ? 'bg-green-500 text-white'
                                            : index === currentStep
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-gray-200 text-gray-500'
                                        }
                                    `}
                                >
                                    {index < currentStep ? (
                                        <Check className="w-5 h-5" />
                                    ) : (
                                        index + 1
                                    )}
                                </div>
                                <div className="mt-2 text-center">
                                    <p className={`
                                        text-sm font-medium
                                        ${index === currentStep ? 'text-indigo-600' : 'text-gray-500'}
                                    `}>
                                        {step.title}
                                    </p>
                                    {step.description && (
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {step.description}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Connector Line */}
                            {index < steps.length - 1 && (
                                <div
                                    className={`
                                        w-24 h-1 mx-4 rounded
                                        ${index < currentStep ? 'bg-green-500' : 'bg-gray-200'}
                                    `}
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Step Content */}
            <div>{children}</div>
        </div>
    );
}
