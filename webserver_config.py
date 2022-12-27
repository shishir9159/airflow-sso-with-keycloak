from __future__ import annotations
import os
import logging
import jwt
import requests
from base64 import b64decode
from flask_appbuilder import expose
from flask import session, redirect
from cryptography.hazmat.primitives import serialization
# from tokenize import Exponent
from airflow.www.fab_security.manager import AUTH_OAUTH
from airflow.www.security import AirflowSecurityManager
from flask_appbuilder.security.views import AuthOAuthView

basedir = os.path.abspath(os.path.dirname(__file__))

log = logging.getLogger(__name__)
WTF_CSRF_ENABLED = True
AUTH_ROLE_ADMIN = 'Admin'
AUTH_TYPE = AUTH_OAUTH
AUTH_ROLE_PUBLIC = 'Viewer'
AUTH_USER_REGISTRATION = True
AUTH_USER_REGISTRATION_ROLE = 'Public'
AUTH_ROLES_SYNC_AT_LOGIN = True
AUTH_ROLES_MAPPING = {
    'airflow_admin': ['Admin'],
    'airflow_op': ['Op'],
    'airflow_user': ['User'],
    'airflow_viewer': ['Viewer'],
    'airflow_public': ['Public'],
}

PROVIDER_NAME = 'keycloak'
CLIENT_ID = 'airflow'
CLIENT_SECRET = 'exampleexampleexampleuidOpF3Xb7bGG'
OIDC_ISSUER = \
    'https://keycloak.oauth.example.com/auth/realms/Airflow'
OIDC_BASE_URL = \
    '{oidc_issuer}/protocol/openid-connect'.format(oidc_issuer=OIDC_ISSUER)
OIDC_TOKEN_URL = \
    '{oidc_base_url}/token'.format(oidc_base_url=OIDC_BASE_URL)
OIDC_AUTH_URL = \
    '{oidc_base_url}/auth'.format(oidc_base_url=OIDC_BASE_URL)
OAUTH_PROVIDERS = [{
    'name': PROVIDER_NAME,
    'label': 'SSO',
    'token_key': 'access_token',
    'icon': 'fa-circle-o',
    'remote_app': {
        'api_base_url': OIDC_BASE_URL,
        'access_token_url': OIDC_TOKEN_URL,
        'authorize_url': OIDC_AUTH_URL,
        'request_token_url': None,
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
        'client_kwargs': {
            'scope': 'email profile'
        },
    },
}]

request = requests.get(OIDC_ISSUER)
key_der_base64 = request.json()['public_key']
key_der = b64decode(key_der_base64.encode())
public_key = serialization.load_der_public_key(key_der)


class CustomAuthRemoteUserView(AuthOAuthView):

    @expose('/logout/', methods=['GET', 'POST'])
    def logout(self):
        for key in list(session.keys()):
            session.pop(key)
        session.clear()
        return redirect(self.appbuilder.get_url_for_login)


class CustomSecurityManager(AirflowSecurityManager):
    """ Override for custom Authentication OID view """
    authoauthview = CustomAuthRemoteUserView

    def oauth_user_info(self, provider, response):
        if provider == PROVIDER_NAME:
            token = response['access_token']
            me = jwt.decode(token, public_key, algorithms=['HS256',
                                                           'RS256'], audience=CLIENT_ID)
            groups = me['resource_access']['airflow']['roles']
            if len(groups) < 1:
                groups = ['airflow_public']
            userinfo = {
                'username': me.get('preferred_username'),
                'email': me.get('email'),
                'first_name': me.get('given_name'),
                'last_name': me.get('family_name'),
                'role_keys': groups,
            }
            log.info('user info: {0}'.format(userinfo))
            return userinfo
        else:
            return {}

    def auth_user_oauth(self, userinfo):
        """
            OAuth user Authentication
            :userinfo: dict with user information the keys have the same name
            as User model columns.
        """

        if 'username' in userinfo:
            username = userinfo['username']
        elif 'email' in userinfo:
            username = userinfo['email']
        else:
            # username is empty
            return None

        if username is None or username == '':
            return None

        # Search in postgres for this user
        user = self.find_user(username=username)
        # user is disabled / not active
        if user and not user.is_active:
            return None

        # user is not registered, neither self-registration available
        if not user and not self.auth_user_registration:
            return None

        # Sync the user's roles
        # if AUTH_ROLES_SYNC_AT_LOGIN is enabled
        if user and self.auth_roles_sync_at_login:
            user_role_objects = set()
            user_role_objects.add(self.find_role(AUTH_USER_REGISTRATION_ROLE))
            for item in userinfo.get('role_keys', []):
                fab_role = self.find_role(item)
                if fab_role:
                    user_role_objects.add(fab_role)
            user_role_keys = userinfo.get("role_keys", [])
            # apply AUTH_ROLES_MAPPING
            user_role_objects.update(self.get_roles_from_keys(user_role_keys))
            # update user roles
            user.roles = list(user_role_objects)
        # User does not exist, create one if self registration.
        if not user and self.auth_user_registration:
            user_role_objects = set()
            user_role_objects.add(self.find_role(AUTH_USER_REGISTRATION_ROLE))
            for item in userinfo.get('role_keys', []):
                fab_role = self.find_role(item)
                if fab_role:
                    user_role_objects.add(fab_role)
            user_role_keys = userinfo.get("role_keys", [])
            # apply AUTH_ROLES_MAPPING
            user_role_objects.update(self.get_roles_from_keys(user_role_keys))
            # update user roles
            user = self.add_user(username=username,
                                 first_name=userinfo.get('first_name', ''),
                                 last_name=userinfo.get('last_name', ''),
                                 email=userinfo.get('email', ''),
                                 role=list(user_role_objects))

            # user registration failed
            if not user:
                log.error("Error creating a new OAuth user %s" % userinfo["username"])
                return None

        # successful login if the user is registered
        if user:
            self.update_user_auth_stat(user)
            return user
        else:
            return None


SECURITY_MANAGER_CLASS = CustomSecurityManager
