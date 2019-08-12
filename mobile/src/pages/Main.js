import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import AsyncStorage from '@react-native-community/async-storage';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

import api from '../services/api';

import logo from '../assets/logo.png';
import like from '../assets/like.png';
import dislike from '../assets/dislike.png';
import itsamatch from '../assets/itsamatch.png';

export default function Main({ navigation }) {
    const id = navigation.getParam('user');
    const [users, setUsers] = useState([]);
    const [matchDev, setMatchDev] = useState(null);

    console.log(id);

    useEffect(() => {
        async function loadUsers() {
            const response = await api.get('/devs', {
                headers: {
                    user: id,
                }
            })
            
            setUsers(response.data);
        }        

        loadUsers();
    }, [id])

    useEffect(() => {
        const socket = io('http://localhost:3333', {
            query: { user: id }
        });

        socket.on('match', dev => {
            setMatchDev(dev);
        })
    }, [id]);

    async function handleLike() {
        const [user, ...rest] = users;

        await api.post(`devs/${user._id}/likes`, null, {
            headers: { user: id },
        })

        setUsers(rest);
    }

    async function handleDislike() {
        const [user, ...rest] = users;

        await api.post(`devs/${user._id}/dislikes`, null, {
            headers: { user: id },
        })

        setUsers(rest);
    }

    async function handleLogout() {
        await AsyncStorage.clear();

       navigation.navigate('Login'); 
    }
    return (
        <View style={style.container} >
            <TouchableOpacity onPress={handleLogout}>
                <Image source={logo} style={style.logo}/>
            </TouchableOpacity>
            
            <View style={style.cardContainer}>
                { users.length === 0 
                    ? <Text style={style.empty}>Acabou :(</Text> 
                    : (
                        users.map((user, index) => (
                            <View  key={user._id} style={[style.card, { zIndex: users.length - index }]}>
                               <Image source={{uri: user.avatar }} style={style.avatar}/>
                               <View style={style.footer}>
                                   <Text style={style.name}>{user.name}</Text>     
                                   <Text style={style.bio} numberOfLine={3}>{user.bio}</Text>     
                               </View>
                           </View>
                        ))
                    )}
            </View>
            
            { users.length > 0 && (
                <View style={style.buttonsContainer}>
                    <TouchableOpacity style={style.button} onPress={handleDislike}>
                        <Image source={dislike} />
                    </TouchableOpacity>
                    <TouchableOpacity style={style.button} onPress={handleLike}>
                        <Image source={like} />
                    </TouchableOpacity>
                </View>   
            )}

            { matchDev && (
                <View style={style.matchContainer}>
                    <Image style={style.matchImage} source={itsamatch} />
                    <Image style={style.matchAvatar} source={{ uri: matchDev.avatar }} />
                    
                    <Text style={style.matchName}>{matchDev.name}</Text>
                    <Text style={style.matchBio}>{matchDev.Bio}</Text>
    
                    <TouchableOpacity onPress={() => setMatchDev(null)}>
                        <Text style={style.closeMatch}>FECHAR</Text>
                    </TouchableOpacity>
                </View>  
            )}
            
        </View>
    );
}

const style = StyleSheet.create({
    logo: {
        marginTop: 30
    },
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    cardContainer: {
        flex: 1,
        alignSelf: 'stretch',
        justifyContent: 'center',
        maxHeight: 500
    },
    card: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        margin: 30,
        overflow: 'hidden',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
    },
    footer: {
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingVertical: 15
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333'
    },
    bio: {
        fontSize: 14,
        color: '#999',
        marginTop: 5,
        lineHeight: 18
    },
    avatar: {
        flex: 1,
        height: 300
    },
    buttonsContainer: {
        flexDirection: 'row',
        marginBottom: 30
    },
    button: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 30,
        elevation: 2

    },
    empty: {
        alignSelf: 'center',
        color: '#999',
        fontSize: 24,
        fontWeight: 'bold'
    },
    matchContainer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center'
    },

    matchImage: {
        height: 60,
        resizeMode: 'contain'
    },

    matchAvatar: {
        width: 160,
        height: 160,
        borderRadius: 80,
        borderWidth: 5,
        borderColor: '#fff',
        marginVertical: 30,
    },

    matchName: {
       fontSize: 26,
       fontWeight: 'bold',
       color: '#fff' 
    },
    
    matchBio: {
        marginTop: 10,
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        lineHeight: 24,
        textAlign: 'center',
        paddingHorizontal: 30
    },

    closeMatch: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
        marginTop: 30,
        fontWeight: 'bold'
    }
});