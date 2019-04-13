export const parseData = (data) => {
    try {
        return JSON.parse(data);
    } catch(e) {
        return null;
    }
}
