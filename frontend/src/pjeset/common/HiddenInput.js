import React, {useState} from 'react';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { ComboBox } from 'office-ui-fabric-react/lib/index';
import { Text } from 'office-ui-fabric-react/lib/Text';
import './HiddenInput.sass';


function HiddenInput({readonly, value, properties, change, variant}) {
    const [edit, setEdit] = useState(true);
    function editable(){
        if(!readonly){setEdit(true)}
    }
    return(
        <div className="HiddenInput">
            {!edit ? <label className="ms-Label root-186 label">{properties.label}</label> : null}
            {!edit ? <Text variant="xLarge" className="text" onClick={editable}>{value}</Text> : null}
            {edit && variant==="textfield" ? <TextField {...properties} value={value} onChange={({target}) => change(target.value)} onBlur={() => setEdit(false)} /> : null}
            {edit && variant==="combobox" ? <ComboBox {...properties} value={value} onChange={(e, {key}) => change(key)} onBlur={() => setEdit(false)} /> : null}
        </div>
    )
}

export default HiddenInput;