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
    subInstruction?: boolean
}

export const StepInstruction = ({stepNumber,subInstruction=false,instruction}: StepInstructionProps) => {
    const completeStep: string = stepNumber + " " + instruction;
    return (<ReactMarkdown 
        className={`markdown ${subInstruction && "ml-11"}`} children={completeStep}/>)
}