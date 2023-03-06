import { useState } from 'react';
import axios from 'axios';
import { rule_info } from './RuleTypes';
import { Toggle } from '../Shared/Toggle';


type RuleToggleProps = {
    value?: boolean, 
    original?: rule_info,
};

const RuleToggle = ({value, original}: RuleToggleProps) => {
  const [enabled, setEnabled] = useState(value);
  
  const submitToggleChange = async(value: boolean) => {
    // @ts-ignore
    const toggleUpdateEndpoint = window._env_.REACT_APP_API_DOMAIN + "/api/toggleRuleActive";
    var togglePostUpdate = {
      uid: original?.uid,
      active: value,
    }
    await axios.post(toggleUpdateEndpoint, togglePostUpdate); 
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