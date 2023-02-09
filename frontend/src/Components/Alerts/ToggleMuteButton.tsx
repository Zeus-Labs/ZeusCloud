import { AlertId } from './AlertsTypes';
import axios from 'axios';
import {UpdateAlertMuteStateData} from './AlertsTypes';
import { SpeakerXMarkIcon, SpeakerWaveIcon } from '@heroicons/react/24/solid';


// updateAlertMuteState will call the backend server to update alerts to appropriate 
// muted state.
async function updateAlertMuteState({alertId, newMutedValue}: UpdateAlertMuteStateData) {
  try {
      const toggleUpdateEndpoint = process.env.REACT_APP_API_DOMAIN + "/api/toggleAlertMuted";
      var togglePostUpdate = {
        alert_id: alertId,
        new_muted_value: newMutedValue,
    }
    const _ = await axios.post(toggleUpdateEndpoint, togglePostUpdate);
      
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

type ToggleMuteButtonProps = {
    muted: boolean,
    resource_id: string,
    ruleDataId: string,
    toggleAlertMuteState: (alertId: AlertId, newMutedValue: boolean) => void;
};

const ToggleMuteButton = ({ muted, resource_id, ruleDataId, toggleAlertMuteState }: ToggleMuteButtonProps) => { 
  async function onClickToggleFn() {
    var alertId: AlertId = {resource_id: resource_id, rule_data_uid: ruleDataId}
    toggleAlertMuteState(alertId, !muted);
    updateAlertMuteState({alertId: alertId, newMutedValue: !muted});
  }

  if (muted) {
    return (
      <div className="relative flex flex-col group">
        <SpeakerXMarkIcon onClick={() => onClickToggleFn()} className="w-5 h-5 "/> 
        <div className="absolute bottom-0 flex flex-col items-center hidden mb-6 group-hover:flex">
            <span className="relative z-10 p-2 text-xs leading-none text-white whitespace-no-wrap bg-black shadow-lg">Unmute</span>
            <div className="w-3 h-3 -mt-2 rotate-45 bg-black"></div>
        </div>
      </div>
    )
  }
  return (
      <div className="relative flex flex-col group">
        <SpeakerWaveIcon onClick={() => onClickToggleFn()} className="w-5 h-5 "/> 
        <div className="absolute bottom-0 flex flex-col items-center hidden mb-6 group-hover:flex">
            <span className="relative z-10 p-2 text-xs leading-none text-white whitespace-no-wrap bg-black shadow-lg">Mute</span>
            <div className="w-3 h-3 -mt-2 rotate-45 bg-black"></div>
        </div>
      </div>
  )
}

export { ToggleMuteButton };