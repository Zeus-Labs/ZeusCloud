function ColoredBgSpan({value,bgColor,textColor}:{value:string,bgColor:string,textColor:string}){
    return (
        <span className={`inline-flex rounded-full bg-${bgColor}-100 px-2 font-semibold leading-5 text-${textColor}-800`}>
            {value}
        </span>
    )
}

export default ColoredBgSpan;