import {createContext} from 'react';
import { getRealm } from '../services/realm';

const RealmContext = createContext({
    realmApp: null,
    setRealmApp: _ => {},
    realm: null,
    setRealm: _ => {}
});

export default RealmContext;
