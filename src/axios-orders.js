import axios from 'axios';

const instance = axios.create({
    baseURL: 'https://react-my-burger-eefc1.firebaseio.com/'
})

export default instance;