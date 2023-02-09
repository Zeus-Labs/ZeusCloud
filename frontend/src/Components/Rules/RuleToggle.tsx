import { useState } from 'react';
import axios, { AxiosError } from 'axios';
import { rule_info, RuleInfoData } from './RuleTypes';
import { Toggle } from '../Shared/Toggle';


type RuleToggleProps = {
    value?: boolean, 
    original?: rule_info,
};

const RuleToggle = ({value, original}: RuleToggleProps) => {
  const [enabled, setEnabled] = useState(value);
  
  const submitToggleChange = async(value: boolean) => {
    try {
      const toggleUpdateEndpoint = process.env.REACT_APP_API_DOMAIN + "/api/toggleRuleActive";
      var togglePostUpdate = {
        uid: original?.uid,
        active: value,
      }
      const response = await axios.post(toggleUpdateEndpoint, togglePostUpdate);
      
    } catch (error) {
        let message = '';
        if (axios.isAxiosError(error)) {
            if (error.response && error.response.data) {
                message = "Error: " + error.response.data
            } else {
                message = "Oops! Encountered an error..."
            }
        } else {
            message = "Error in retrieving rules information."
        }
    }
  }

  const handleToggle = (value: boolean) => {
    setEnabled(value);
    submitToggleChange(value);
  }

  return (
    <Toggle enabled={enabled} onChange={handleToggle} />
  )
}

export {RuleToggle};