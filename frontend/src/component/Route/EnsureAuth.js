import React, {Fragment, useEffect} from "react";
import { useSelector, useDispatch } from 'react-redux';
import { Redirect, Route } from 'react-router-dom';
import { checkAuthStatus } from '../../actions/userAction'; // Ajuste o caminho conforme necessário

/*const EnsureAuth = ({ children }) => {
    const dispatch = useDispatch();
    const authState = useSelector(state => state.auth || {});
    const { isAuthenticated, checkingAuth } = authState;

    useEffect(() => {
        dispatch(checkAuthStatus());
    }, [dispatch]);

    // Se o status de autenticação ainda está sendo verificado, renderize algo como um carregamento
    if (checkingAuth) {
        return <div>Verificando autenticação...</div>;
    }

    // Se não estiver autenticado, redirecione para a página de login
    if (!isAuthenticated) {
        return <Redirect to="/login" />;
    }

    // Se estiver autenticado, renderize os componentes filhos
    return children || null; // Garante que sempre há um retorno, mesmo que children seja undefined
}; */

const EnsureAuth = ({ component: Component, ...rest }) => {
    const dispatch = useDispatch();
    const authState = useSelector(state => state.auth || {});
    const { isAuthenticated, checkingAuth } = authState;

    useEffect(() => {
        dispatch(checkAuthStatus());
    }, [dispatch]);
    
    if (checkingAuth) {
        // Opcional: Renderize algo enquanto a verificação de autenticação está em andamento
        return <div>Verificando autenticação...</div>;
    }

    return (
        <Route {...rest} render={props => (
            isAuthenticated ? <Component {...props} /> : <Redirect to="/login" />
        )} />
    );
};

export default EnsureAuth;