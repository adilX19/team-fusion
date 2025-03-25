import api from "./api";

export const login = async (username, password) => {

    const response = await api.post('/auth/login', { username, password }, { withCredentials: true });
    if (response.status == 200) {
        if (response.data.login) {
            return response;
        }
    }
    return false
};

export const signup = async (username, email, password, confirm_password, role) => {
    return await api.post(
        `/auth/register`,
        { username, email, password, confirm_password, role },
        { withCredentials: true } // To handle cookies
    );
};

export const logout = () => {
    return api.post(`/auth/logout`, {}, { withCredentials: true });
};
