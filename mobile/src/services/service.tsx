import axios from 'axios';

const services = axios.create({
    baseURL: 'http://192.168.0.9:3333'
})

export default services