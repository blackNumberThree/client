// подключение к сокет-серверу чата
let socket = io.connect('http://webiraylab.eu-4.evennode.com/');
//***********************************

//переменные чтобы открыть\ закрыть окошко авторизации
let chat = document.querySelector('.card-chat');
let auth = document.querySelector('.card');
let login= document.querySelector('.card__login');
let parol= document.querySelector('.card__parol');
    function collAuth(argument) {
        auth.style.display='block'
    }
    function collChat(argument) {
        auth.style.display='none'
        chat.style.display='block'
    }
    function hiddenAuth(argument) {
        auth.style.display='none'
    }
    function hiddenChat(argument) {
        chat.style.display='none'
      $('.contacts__item-chat').css("display", "block")
    }
//************************


// функция авторизации
function authorization (argument) {
 $('form').submit( (e)=>{

//впомогательные функции
      e.preventDefault();
      $('.auth').css("display", "none")
      $('.container').css("display", "flex")
//***********


//отправляем аджакс запрос на бекенд сервер для авторизации
      $.ajax({
      type: "get",
      url: "https://webiraylab.com/projects/xtelecom/backend/xtele/endpoint.php",
      data: `page=authorize&login=${login.value}&password=${parol.value}`,
      success: function(req){
      if(req !=="error") {
 //впомогательные функции
        $('.auth').css("display", "flex")
        $('.container').css("display", "none")
        $('.contacts__item-chat').css("display", "none")
//***********

//получаем ответ от сервера с нужной инфой
        let messedge= JSON.parse(req)
        collChat(),
//сохраняю инфу для себя(это необязательно)
        sessionStorage.setItem('author', messedge.user_fio),
        sessionStorage.setItem('auth_phone', messedge.user_phone_number),
        sessionStorage.setItem('auth_contact_number',messedge.user_contract_number),
        sessionStorage.setItem('auth_balance', messedge.user_balance),
        sessionStorage.setItem('auth_tariff_inet', messedge.user_tariff_inet),
        sessionStorage.setItem('auth_address', messedge.user_address),
//создаем объект со всей инфой о клиенте
        userInfo={
          author:sessionStorage.getItem('author'),
          auth_phone:sessionStorage.getItem('auth_phone'),
          auth_contact_number:sessionStorage.getItem('auth_contact_number'),
          auth_balance:sessionStorage.getItem('auth_balance'),
          auth_tariff_inet:sessionStorage.getItem('auth_tariff_inet'),
          auth_address:sessionStorage.getItem('auth_address')
          }
// отправляем на сервер событие:
// первый параметр - тип события,
// второй - id новой комнаты(для id мы используем адресс),
// и третий параметр -  обьект со всей информацией о пользователе 
        socket.emit('ADD_USER', sessionStorage.getItem('auth_address'), userInfo) 
        } else 
       {
//если ошибка авторизации выводим сообщение об ошибки
        $('.auth').css("display", "flex")
        $('.container').css("display", "none")
        $('.err').css("visibility", "visible")
      }
       }
      })
   })

}


//небольшая вспомогательная функция
  let currentRoom = sessionStorage.getItem('auth_contact_number');
  function repeat(data) { $(' .entry__request').val(data)}
    //**************


//слушатель события TO_CHAT_MESS, принимает событие с сервера создает макет нового сообщение
// сообщения data.role == "admin" и data.role == "guest "отображаються по разному
          socket.on('TO_CHAT_MESS', function(data){
            if (data.role == "admin") {
                       $('.chat').append(
                      ` <div class='chat__messedge ${data.role}'>
                          <p class="chat__request">
                           ${data.request}
                         </p>
                      <p class="chat__autor">
                           ${data.author}
                      </p>
                      <svg class="card__repeat-img" onclick="repeat('${data.message}')"   width="10" height="9" viewBox="0 0 10 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9.63478 4.22673L5.6307 0.0144043V2.5275H4.77938C2.13979 2.5275 0 4.58041 0 7.11301V8.44484L0.378052 8.04729C1.66369 6.69596 3.48264 5.92596 5.38965 5.92596H5.63051V8.43906L9.63478 4.22673Z" fill="#FF8108"/>
                      </svg>
                           <div class="chat__text-wrapper">
                          <p class="chat__messedge-text">
                           ${data.message}
                          </p>
                      </div>
                  </div> `       
                );
              }  else{     
               $('.chat').append(
                ` <div class='chat__messedge ${data.role}'>
                <p class="chat__request">
                           ${data.request}
                </p>
                      <p class="chat__autor">
                           Вы
                      </p>
                           <div class="chat__text-wrapper">
                          <p class="chat__messedge-text">
                           ${data.message}
                          </p>
                      </div>
                  </div> `       
               );
             }
          });


//по клику на кнопке "отправить"  запуск события "отправить на сервер" 
          $('.entry__send-img').click(function(){
          //проверка, не пустое ли поле отправления
       		if ( $(' .entry__response').val() ) {
//первый аргумент - тип события(отправка сообщения на сервер) 
                socket.emit('TO_SERVER_MESS', 
//второй - объект в котором информация о сообщении
         				{
  		              role:' guest' ,
  		              author: sessionStorage.getItem('author'),
  		              message:$(' .entry__response').val(),
  		              request:$(' .entry__request').val(),
  		              time:new Date().toLocaleString(),
  		              current_room:sessionStorage.getItem('auth_address')
  		            });
		            message:$(' .entry__response').val('')
		            request:$(' .entry__request').val('')}
       		else{}
     	   });
/*
Всего у чата три функции
1 авторизация (прием всех данных о клиенте с карбона и передача их на наш сервер)
2 отправка сообщений на сервер 
3 прием сообщения и отображение в чате

принип работы чата: клиент пишет сообщение на сервере оно отправляеться и клиенту и админу
(так достигаем синхронности отправки сообщений)


*/