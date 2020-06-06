import React, { useState, useEffect } from 'react'
import { View, ImageBackground, Text, Image, StyleSheet, Alert } from 'react-native';
import { Feather as Icons } from '@expo/vector-icons'
import { RectButton } from 'react-native-gesture-handler'
import { useNavigation } from '@react-navigation/native'
import RNPickerSelect from 'react-native-picker-select';
import axios from 'axios';

interface IBGEUFResponse {
  id: number,
  sigla: string
}

interface IBGECityResponse {
  id:number,
  nome:string
}

const Home = () => {
    const navigation = useNavigation()
    const [ufs, setUfs] = useState<IBGEUFResponse[]>([])
    const [selectedUf, setSelectedUf] = useState('0')
    const [cities, setCities] = useState<IBGECityResponse[]>([])
    const [citySelected, setCitySelected] = useState<string>()
    
    useEffect(()=> {
      axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(res=>{                
        const ufInitials = res.data.map(uf => { 
           return {
               id: uf.id,
               sigla: uf.sigla
           }
        })
        setUfs(ufInitials)
        }).catch(err=>Alert.alert('Error', 'Não foi possível carregar os Estados'))
    },[])

    useEffect(()=>{
      if(selectedUf === '0')  return;

      axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`)
           .then(res=>{
                  const cities = res.data.map( city => (
                    {
                       id: city.id,
                       nome: city.nome
                   }))
              setCities(cities)
           })
           .catch(err=>Alert.alert('Error', 'Não foi possível carregar as cidades'))
    },[selectedUf])

    function handleNavigateToPoints() {
      navigation.navigate('Points', {uf:selectedUf, city:citySelected})
    }
    
    return(
        <ImageBackground source={require('../../assets/home-background.png')} 
                         style={styles.container}
                         imageStyle={{ width: 274, height: 368 }}>
          <View style={styles.main}>
            <Image source={require('../../assets/logo.png')} />
            <Text style={styles.title}>Seu marketplace de coleta de resíduos</Text>
            <Text style={styles.description}>Ajudamos pessoas a encontrarem pontos 
            de coleta de forma eficiente</Text>

            <RNPickerSelect style={{ ...pickerSelectStyles }}
                            onValueChange={value => setSelectedUf(value)}
                            placeholder={{
                              label: 'Selecione um Estado',
                              value: null,
                            }}
                            
                            items={ufs.map(uf=>(
                              { label: uf.sigla, value:uf.sigla }
                            ))}
                />

            <RNPickerSelect style={{ ...pickerSelectStyles }}
                            onValueChange={value => setCitySelected(value)}
                            placeholder={{
                              label: 'Selecione a Cidade',
                              value: null,
                            }}
                            items={cities.map(city=>(
                              { label: city.nome, value:city.nome }
                            ))}
              />
          </View>

          <View style={styles.footer}>
              <RectButton style={styles.button} onPress={handleNavigateToPoints}>
                  <View style={styles.buttonIcon}>
                    <Text> 
                        <Icons name="arrow-right" color="#FFF" size={24}/> 
                    </Text>
                  </View>
                  <Text style={styles.buttonText}>Entrar</Text>
              </RectButton>
          </View>
        </ImageBackground>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 32,
      },
    
      main: {
        flex: 1,
        justifyContent: 'center',
      },
    
      title: {
        color: '#322153',
        fontSize: 28,
        fontFamily: 'Ubuntu_700Bold',
        maxWidth: 260,
        marginTop: 64,
      },
    
      description: {
        color: '#6C6C80',
        fontSize: 16,
        marginTop: 16,
        fontFamily: 'Roboto_400Regular',
        maxWidth: 260,
        lineHeight: 24,
      },
    
      footer: {},
    
      select: {},
    
      input: {
        height: 60,
        backgroundColor: '#FFF',
        borderRadius: 10,
        marginBottom: 8,
        paddingHorizontal: 24,
        fontSize: 16,
      },
    
      button: {
        backgroundColor: '#34CB79',
        height: 60,
        flexDirection: 'row',
        borderRadius: 10,
        overflow: 'hidden',
        alignItems: 'center',
        marginTop: 20,
      },
    
      buttonIcon: {
        height: 60,
        width: 60,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        justifyContent: 'center',
        alignItems: 'center'
      },
    
      buttonText: {
        flex: 1,
        justifyContent: 'center',
        textAlign: 'center',
        color: '#FFF',
        fontFamily: 'Roboto_500Medium',
        fontSize: 16,
      }
});

const pickerSelectStyles = StyleSheet.create({
  inputAndroid: {
    color: '#000',
    paddingHorizontal: 24,
    borderRadius: 5,
    fontSize: 16,
    marginBottom:12,
	},
});

export default Home