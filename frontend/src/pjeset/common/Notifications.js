import React, {createRef} from 'react';
import { Callout, DirectionalHint } from 'office-ui-fabric-react/lib/Callout';
import './Notifications.sass';

function Notifications(){
    function onDismiss(){
        console.log('dismiss')
    }
    let anchor;
    return(
        <div id="notifications">
             <Callout
                className="ms-CalloutExample-callout"
                onDismiss={onDismiss}
                target={anchor}
                directionalHint={DirectionalHint.rightBottomEdge}
                coverTarget={true}
                isBeakVisible={false}
                gapSpace={0}
            >
                Hello
            </Callout>
            <div ref={ref => anchor = ref} className="anchor"></div>
        </div>
    )
}

export default Notifications;