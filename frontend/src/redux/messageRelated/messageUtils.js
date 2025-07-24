export const getMessagesDetail = (userId, userModel, receiverId, receiverModel) => async (dispatch) => {
    try {
        const response = await axios.get(`${API_URL}/Messages/${userId}/${userModel}/${receiverId}/${receiverModel}`);
        dispatch(getMessageDetailSuccess(response.data));
    } catch (error) {
        dispatch(getMessageDetailFailed(error.response.data));
    }
}
