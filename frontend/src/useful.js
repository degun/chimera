export function urltoid(url){
    const arr = url.split("/");
    return arr[arr.length - 2];
}

export function formatText(text){
    return text[0] + text.toLowerCase().slice(1).replace('_', ' ')
}

export function formatDate(date){
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-UK', options)
}

export function round2(num){
    return Math.round(num * 100 + Number.EPSILON) / 100
}