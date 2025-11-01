import { postData } from "../postData.js";

export const postChatMessage = async (formEl) => {
    try {
        const data = await postData(formEl, "genericchat/");

        if (!data) {
            throw new Error("No data returned from server.");
        }

        return data;
    } catch (error) {
        console.error("Error in postChatMessage:", error);
        return null;
    }
};
