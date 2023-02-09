import ReactMarkdown from "react-markdown";

export interface NormalInstructionProps {
    instruction: string;
}

export const NormalInstruction = (prop: NormalInstructionProps) => {
    return (
        <ReactMarkdown className="markdown" children={prop.instruction}
    />)
}

export interface StepInstructionProps extends NormalInstructionProps {
    stepNumber: string;
}

export const StepInstruction = (prop: StepInstructionProps) => {
    const completeStep: string = prop.stepNumber + " " + prop.instruction;
    return (<ReactMarkdown 
        className="markdown" children={completeStep}/>)
}