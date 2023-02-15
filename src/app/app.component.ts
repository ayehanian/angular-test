// @ts-nocheck
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'test-angular-app';
  element: HTMLElement | undefined;


  ngOnInit() {
    function PlayHera(clientId: string, container: string) {
      const playheraPage = 'http://stage-web.playhera.com/'
      const playheraBaseURL = 'https://stage-mena.playhera.com/api/';
      const defaultAvatar = 'default-user.svg'

      const self = this;
      const accessTokenKey = 'access_token';
      const accessTokenExpiryKey = 'access_token_expires';
      const refreshTokenKey = 'refresh_token';
      let pendingRefresh = false;

      const currentUrl = window.location.search;
      const urlParams = new URLSearchParams(currentUrl);
      const fromMobile = urlParams.get('frmb');
      let refresh = urlParams.get(refreshTokenKey);
      let access = urlParams.get(accessTokenKey);

      (function() {
        createLoginBtn();
        if(refresh && access) startLogin()

        console.log('readyState',document.readyState)
        if(document.readyState !== 'loading') {
          if (window.webkit && window.webkit.messageHandlers) {
            console.log( window.webkit)
            window.webkit.messageHandlers.submit.postMessage("toggleFullScreen");
          }
        } else {
          document.addEventListener("DOMContentLoaded", function() {
            console.log( window.webkit)
            if (window.webkit && window.webkit.messageHandlers) {
              window.webkit.messageHandlers.submit.postMessage("toggleFullScreen");
            }
          });
        }

        document.addEventListener('fullscreenchange', fullScreenChanged);
      })();

      self.isOpenedFromMobile = function() {
        return fromMobile;
      };

      self.getSubscriptionStatus = async function() {
        let response = await fetch(playheraBaseURL + 'payments/mysubscriptions', {
          headers: {
            Authorization: getCookie(accessTokenKey),
            'Content-Type': 'application/json; charset=utf-8',
          },
        });
        let result = await response.json();
        return result;
      };

      self.getProfile = async function() {
        let response = await fetch(playheraBaseURL + 'profiles/my', {
          headers: {
            Authorization: getCookie(accessTokenKey),
            'Content-Type': 'application/json; charset=utf-8',
          },
        });
        let result = await response.json();

        return result;
      };

     self.onFullScreenOn = function() {
        if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.toggleMessageHandler) {
            window.webkit.messageHandlers.submit.postMessage('toggleFullScreen');
        }
        if (window.androidInterface ) window.androidInterface.isFullscreenOn()
    };

    self.onFullScreenOff = function() {
        if (window.androidInterface ) window.androidInterface.isFullscreenOff()
    };
      
      function fullScreenChanged (event) {
        if (document.fullscreenElement) {
          if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.toggleMessageHandler) {
            window.webkit.messageHandlers.submit.postMessage('toggleFullScreen');
          }
          if (window.androidInterface ) window.androidInterface.isFullscreenOn()
          console.log(`Element: ${document.fullscreenElement.id} entered fullscreen mode.`);
        } else {
          console.log('Leaving fullscreen mode.');
          if (window.androidInterface ) window.androidInterface.isFullscreenOff()
        }
      }

      function createLoginBtn() {
        const wrapper =  document.querySelector(container)
        wrapper.style.width = '100%'
        wrapper.style.display = 'flex'
        wrapper.style.justifyContent = 'center'
        wrapper.style.alignItems = 'center'
        wrapper.style.background = ' #0b0e13'

        const button = document.createElement('button');
        button.id = 'ph-login';
        button.innerHTML = 'Subscribe and Play';
        button.onclick = checkLoggedState
        button.style.cssText ='cursor:pointer;margin:8px;padding: 10px 20px;border-radius: 200px;border: none;background: #8261fc;min-height: 2rem;min-width: 110px;color: white;font-size: 1rem;font-weight: 600;'
        wrapper.appendChild(button);
      }

      function getProfile() {
        return fetch(playheraBaseURL + 'profiles/my', {
          headers: {
            Authorization: getCookie(accessTokenKey),
            'Content-Type': 'application/json; charset=utf-8',
          },
        })
          .then(response => response.json())
          .then(data => {
            const button = document.getElementById('ph-login');
            button.style.display = 'none';

            const profile = document.createElement('div');
            profile.id = 'ph-profile';
            profile.style.position = 'relative'
            profile.addEventListener('click', function(e) {
              e.stopPropagation()
              const menu = document.getElementById('ph-menu');
              menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
            }, false);

            const avatar = document.createElement('img');
            avatar.src = data.avatar || playheraPage + defaultAvatar;
            avatar.style.cssText ='margin:9px;cursor:pointer;border: 2px solid #6300FA;border-radius: 5px;width: 36px;min-width: 26px;height: 36px;background: #727288;object-fit: cover;';
            profile.appendChild(avatar);

            profile.appendChild( createAvatarMenu(data.login) );
            const css = 'a:hover{ background-color: #3a3a4f }';
            const style = document.createElement('style');
            style.appendChild(document.createTextNode(css));
            document.getElementsByTagName('a')[0].appendChild(style);

            document.querySelector(container).appendChild(profile);
            document.body.addEventListener('click', function() {
              document.getElementById('ph-menu').style.display = 'none';
            }, false);
          });
      }

      function createAvatarMenu(login) {
        const menuItems = [
          {id:'ph-menu-profile', icon: playheraPage +'menu-profile.svg', name:'My Profile', link: `${playheraPage}profiles/${login}/` },
          {id:'ph-menu-competitions', icon: playheraPage +'menu-flag.svg', name:'My Competitions', link: playheraPage + 'my-tournaments' },
          {id:'ph-menu-matches', icon: playheraPage +'menu-fire.svg', name:'My Matches', link: playheraPage + 'my-matches'},
          {id:'ph-menu-subscriptions', icon: playheraPage +'menu-star.svg', name:'Subscriptions', link: playheraPage + 'subscription?view=true' },
          {id:'ph-menu-shop-acc', icon: playheraPage +'menu-headphones.svg', name:'My Shopping Account', link:''},
          {id:'ph-menu-shop-orders', icon: playheraPage +'menu-headphones.svg', name:'My Orders', link:''},
          {id:'ph-menu-logout', icon: playheraPage +'menu-logout.svg', name:'Log Out', link:''},
        ];

        const list = document.createElement('ul');
        list.id = 'ph-menu';
        list.style.cssText ='background: #18181E;z-index: 5;border: 1px solid #383843;border-radius: 5px; display: none;width: max-content;padding: 0 0 35% 0;position: absolute;right: 6px;top: 53px;';

        const afterEl = 'ul:after{ content:" ";width: 18px;height: 4px;background-color: #6300FA;position: absolute;top: -4px;right: 12px; }';
        const style = document.createElement('style');
        style.appendChild(document.createTextNode(afterEl));
        list.appendChild(style);

        for (let i = 0; i < menuItems.length; i++) {
          const item = document.createElement('a');
          item.href = menuItems[i].link
          item.style.cssText ='font-size:1rem;display: flex;padding: 14px;color: white;text-decoration: none;';
          if(menuItems[i].id === 'ph-menu-logout') item.onclick = logout;
          item.appendChild(document.createTextNode(menuItems[i].name));

          const icon = document.createElement('img');
          icon.src = menuItems[i].icon
          icon.style.cssText ='margin-right: 15px;width: 20px;height:20px';
          item.prepend(icon)

          list.appendChild(item);
        }
        return list;
      }

      function makeRefreshToken() {
        if (pendingRefresh) return;

        pendingRefresh = true;
        try {
          let refreshToken = getCookie(refreshTokenKey);
          fetch(playheraBaseURL + 'auth/refresh', {
            method: 'POST',
            headers: { Authorization: 'Bearer ' + refreshToken },
          })
            .then(response => response.json())
            .then(data => {
              setAuthToCookie(data);
            });
        } finally {
          pendingRefresh = false;
        }
      }

      function signInRefreshAuth() {
        if (pendingRefresh) return;

        pendingRefresh = true;
        try {
          let accessTokenExpiry = getCookie(accessTokenExpiryKey);
          let refreshToken = getCookie(refreshTokenKey);

          if (
            (refreshToken && !accessTokenExpiry) ||
            accessTokenExpiry * 1000 - new Date().getTime() < 60000
          ) {
            makeRefreshToken();
          }
        } catch (error) {
          console.error('Service not available');
          throw error;
        } finally {
          pendingRefresh = false;
        }
      }

      function startRefreshTokenJob() {
        signInRefreshAuth();
        setInterval(signInRefreshAuth, 20000);
      }

      async function startLogin() {
        setCookie(refreshTokenKey, refresh);
        setCookie(accessTokenKey, access);
        window.history.replaceState({}, document.title, "/" );
        await getProfile();
        startRefreshTokenJob();
      }

      function checkLoggedState() {
        if (refresh && access) {
          startLogin()
        } else window.location.href = playheraPage + `sso?client=${clientId}`;
      }

      function logout(e) {
        e.preventDefault();
        access = null;
        refresh = null;
        eraseCookie('refresh_token')
        eraseCookie('access_token')
        document.getElementById('ph-login').style.display = 'block';
        document.getElementById('ph-profile').style.display = 'none';
      }

      function setAuthToCookie(data) {
        if (data.access_token) {
          setCookie(
            'access_token',
            data.access_token,
            data.access_token_expires
          );
          setCookie(
            'access_token_expires',
            data.access_token_expires,
            data.access_token_expires
          );
          setCookie(
            'refresh_token',
            data.refresh_token,
            data.refresh_token_expires
          );
          setCookie(
            'refresh_token_expires',
            data.refresh_token_expires,
            data.refresh_token_expires
          );
        }
      }

      function setCookie(cname, cvalue, expiry) {
        const d = new Date();
        d.setTime(expiry * 1000);
        let expires = 'expires=' + d.toUTCString();
        document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
      }

      function getCookie(cname) {
        let name = cname + '=';
        let decodedCookie = decodeURIComponent(document.cookie);
        let ca = decodedCookie.split(';');
        for (let i = 0; i < ca.length; i++) {
          let c = ca[i];
          while (c.charAt(0) == ' ') {
            c = c.substring(1);
          }
          if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
          }
        }
        return '';
      }

      function eraseCookie(name) {
        document.cookie = name + '=; Max-Age=0'
      }
    }
    const playhera = new PlayHera(
      'C86D279A-E3AA-4EA0-B539-8E7F24D907DA',
      '#ph-login-container'
    );
  }

  toggleFullScreen () {
    if (document.fullscreenElement) document.exitFullscreen()
    else {
      this.element = document.getElementById('main-container') as HTMLElement;
      this.element.requestFullscreen();
    }
  };

}
