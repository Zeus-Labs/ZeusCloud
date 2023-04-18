function ColoredBgSpan({value,bgColor,textColor}:{value:string,bgColor:string,textColor:string}){
    return (
        <span className={`inline-flex rounded-full ${bgColor} px-2 font-semibold leading-5 ${textColor}`}>
            {value}
        </span>
    )
}

export default ColoredBgSpan;