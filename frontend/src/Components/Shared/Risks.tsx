const Risks = (values: any) => {
    return (
        <div className="flex flex-row flex-wrap space-x-0.5 space-y-1">
          {values.values?.map((value: any, idx: number) => {
            return (
                <span key={value} className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                    {value}
                </span>
            );
          })}
        </div>
      );
}

export {Risks};