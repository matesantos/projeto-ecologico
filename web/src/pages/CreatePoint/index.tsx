import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi'
import { Map, TileLayer, Marker } from 'react-leaflet'
import { LeafletMouseEvent } from 'leaflet'

import './style.css'

import Dropzone from '../../components/Dropzone'

import axios from 'axios'

import api from '../../service/api'
import logo from '../../assets/logo.svg'

// array ou objeto: manualmente informar o tipo da variável
// usando o typescripy

interface Item {
    id: number,
    title: string,
    image_url: string
}

interface IBGEUFResponse {
    id: number,
    sigla: string
}

interface IBGECityResponse {
    id:number,
    nome:string
}

const CreatePoint = () => {

    const [items, setItems] = useState<Item[]>([])
    const [ufs, setUfs] =  useState<IBGEUFResponse[]>([])
    const [selectedUf, setSelectedUf] = useState('0')
    const [cities, setCities] = useState<IBGECityResponse[]>([])
    const [selectedCity, setselectedCity] = useState('0')
    const [selectedPosition, setselectedPosition] = useState<[number, number]>([0, 0])
    const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0])
    const [selectedItems, setSelectedItems] = useState<number[]>([0])
    const [selectedFile, setSelectedFile] = useState<File>()

    const [inputData, setInputData] = useState({
        name: '',
        email: '',
        whatsapp: ''
    })

    const history = useHistory()

    useEffect(()=>{
       api.get('items').then( res => setItems(res.data)
    )},[])

    useEffect(()=>{
        axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(res=>{                
            const ufInitials = res.data.map(uf => { 
               return {
                   id: uf.id,
                   sigla: uf.sigla
               }
            })
            setUfs(ufInitials)
        })
     },[])

     useEffect(()=>{
        if(selectedUf === '0')  return;

        axios.get<IBGECityResponse[]>
        (`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`).then(res=>{                
            const cities = res.data.map(city => { 
               return {
                   id: city.id,
                   nome: city.nome
               }
            })
            setCities(cities)
        })
     },[selectedUf])

     useEffect(() => {
         navigator.geolocation.getCurrentPosition(position => {
             const { latitude, longitude } = position.coords
             setInitialPosition([latitude, longitude])
         })
     },[])

     const handleSelectedUf = (e: ChangeEvent<HTMLSelectElement>) => {
          const uf = e.target.value;
          setSelectedUf(uf)
     }
    
     const handleSelectedCity = (e: ChangeEvent<HTMLSelectElement>) => {
          const city = e.target.value;
          setselectedCity(city)
     }

     const handleMapItems = (e: LeafletMouseEvent) => {
        setselectedPosition([
            e.latlng.lat,
            e.latlng.lng
        ])
     }

     const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setInputData({ ...inputData, [name]:value })
     }

     const handleSelectItems = (id:number) => {
        const alreadySelected =  selectedItems.findIndex(item => item === id)
        if(alreadySelected >= 0 ){
            const filteredItems = selectedItems.filter(item => item !== id)
            setSelectedItems(filteredItems)
        }else{
            setSelectedItems([...selectedItems, id])
        }
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()

        const {name, email, whatsapp} = inputData;
        const uf = selectedUf;
        const city = selectedCity;
        const [latitude, longitude] = selectedPosition;
        const items = selectedItems

        const dados = new FormData()

        dados.append('name',name); 
        dados.append('email',email); 
        dados.append('whatsapp',whatsapp);
        dados.append('uf',uf);
        dados.append('city',city);
        dados.append('latitude',String(latitude));
        dados.append('longitude',String(longitude));
        dados.append('items',items.join(','));
        if(selectedFile) dados.append('image',selectedFile);

        await api.post('/points', dados)
                 .then(res=> alert('Cadastrado com sucesso. '))
                 .catch(err=>console.log(err))

        history.push('/')
    }

    return (
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta"/>
                <Link to='/'>
                    <FiArrowLeft /> Voltar para home
                </Link>
            </header>

            <form onSubmit={ e => handleSubmit(e) }>
                <h1>Cadastro do <br/> ponto de coleta</h1>

                <Dropzone onFileUpLoaded={setSelectedFile} />

                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>

                    <div className="field">
                        <label htmlFor="name">Nome da entidade</label>
                        <input id="name" name="name" type="text" onChange={e => handleInputChange(e) }/>
                    </div>
                </fieldset>

                <div className="field-group">
                    <div className="field">
                        <label htmlFor="name">E-mail</label>
                        <input id="email" name="email" type="email" onChange={e => handleInputChange(e) }/>
                    </div>

                    <div className="field">
                        <label htmlFor="name">Whatsapp</label>
                        <input id="whatsapp" name="whatsapp" type="text" onChange={e => handleInputChange(e) }/>
                    </div>
                </div>
                
                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>

                    <Map center={initialPosition} zoom={15} onclick={ e => handleMapItems(e) }>
                        <TileLayer
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={selectedPosition} />
                    </Map>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado(UF)</label>
                            <select name="uf" id="uf" onChange = { e => handleSelectedUf(e) }>
                                <option value="0">Selecione uma uf</option>
                                {ufs.map(uf=>(
                                    <option key={uf.id} value={uf.sigla}>{uf.sigla}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select name="city" id="city" onChange={ e => handleSelectedCity(e) }>
                                <option value="0">Selecione uma cidade</option>
                                {cities.map(c=>(
                                     <option key={c.id} value={c.nome}>{c.nome}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </fieldset>
                
                <fieldset>
                    <legend>
                        <h2>Ítens de coleta</h2>
                        <span>Selecione um ou mais itens Abaixo</span>
                    </legend>

                    <ul className="items-grid">
                        {items.map(item => (
                            <li key={item.id} 
                                onClick={ () => handleSelectItems(item.id) } 
                                className={ selectedItems.includes(item.id)? 'selected':'' }>
                                <img src={item.image_url} alt={item.title}/>
                                <span>{item.title}</span>
                            </li>
                        ))}
                    </ul>
                </fieldset>

                <button type="submit">
                    Cadastrar ponto de coleta
                </button>
            </form>
        </div>
    )
}

export default CreatePoint