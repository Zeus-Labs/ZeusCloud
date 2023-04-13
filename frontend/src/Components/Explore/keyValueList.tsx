function KeyValueList({data}:{data:{[label:string]:any}}) {
    return (
      <table>
        <tbody>
        {Object.entries(data).map(([key, value]) => (
          <tr key={key} className="text-sm font-medium text-gray-500">
            <td className="capitalize w-fit px-2 py-3">{key}</td>
            {value!==null
            ? (value instanceof Array ? 
                <td className="text-gray-700 px-2 py-3">
                    <ul>
                    {value.map(val=><li className="text-gray-700">{val}</li>)}
                    </ul>
                </td>
                :  <td className="text-gray-700 px-2 py-3">{value}</td>

                )
            : <td className="text-gray-700 px-2 py-3">Null</td>
            }
          </tr>
        ))}
        </tbody>
      </table>
    );
  }
  
  export default KeyValueList;