function autocomplete(inp, arr) {
  /*the autocomplete function takes two arguments,
  the text field element and an array of possible autocompleted values:*/
  var currentFocus;
  /*execute a function when someone writes in the text field:*/
  inp.addEventListener("input", function(e) {
      var a, b, i, val = this.value;
      /*close any already open lists of autocompleted values*/
      closeAllLists();
      if (!val) { return false;}
      currentFocus = -1;
      /*create a DIV element that will contain the items (values):*/
      a = document.createElement("DIV");
      a.setAttribute("id", this.id + "autocomplete-list");
      a.setAttribute("class", "autocomplete-items");
      /*append the DIV element as a child of the autocomplete container:*/
      this.parentNode.appendChild(a);
      /*for each item in the array...*/
      for (i = 0; i < arr.length; i++) {
        /*check if the item starts with the same letters as the text field value:*/
        if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
          /*create a DIV element for each matching element:*/
          b = document.createElement("DIV");
          /*make the matching letters bold:*/
          b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
          b.innerHTML += arr[i].substr(val.length);
          /*insert a input field that will hold the current array item's value:*/
          b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
          /*execute a function when someone clicks on the item value (DIV element):*/
          b.addEventListener("click", function(e) {
              /*insert the value for the autocomplete text field:*/
              inp.value = this.getElementsByTagName("input")[0].value;
              /*close the list of autocompleted values,
              (or any other open lists of autocompleted values:*/
              closeAllLists();
          });
          a.appendChild(b);
        }
      }
  });
  /*execute a function presses a key on the keyboard:*/
  inp.addEventListener("keydown", function(e) {
      var x = document.getElementById(this.id + "autocomplete-list");
      if (x) x = x.getElementsByTagName("div");
      if (e.keyCode == 40) {
        /*If the arrow DOWN key is pressed,
        increase the currentFocus variable:*/
        currentFocus++;
        /*and and make the current item more visible:*/
        addActive(x);
      } else if (e.keyCode == 38) { //up
        /*If the arrow UP key is pressed,
        decrease the currentFocus variable:*/
        currentFocus--;
        /*and and make the current item more visible:*/
        addActive(x);
      } else if (e.keyCode == 13) {
        /*If the ENTER key is pressed, prevent the form from being submitted,*/
        e.preventDefault();
        if (currentFocus > -1) {
          /*and simulate a click on the "active" item:*/
          if (x) x[currentFocus].click();
        }
      }
  });
  function addActive(x) {
    /*a function to classify an item as "active":*/
    if (!x) return false;
    /*start by removing the "active" class on all items:*/
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (x.length - 1);
    /*add class "autocomplete-active":*/
    x[currentFocus].classList.add("autocomplete-active");
  }
  function removeActive(x) {
    /*a function to remove the "active" class from all autocomplete items:*/
    for (var i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }
  function closeAllLists(elmnt) {
    /*close all autocomplete lists in the document,
    except the one passed as an argument:*/
    var x = document.getElementsByClassName("autocomplete-items");
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }
  /*execute a function when someone clicks in the document:*/
  document.addEventListener("click", function (e) {
      closeAllLists(e.target);
  });
}

/*An array containing all the country names in the world:*/
var filmy = [
		'7 Krasnoludków: Historia prawdziwa',
		'7 Krasnoludków: Historia jeszcze prawdziwsza: Las to za mało', 
		'13 Posterunek',
		'13 Posterunek 2',
        '300',
		'1670',
		'500000000 years button',
		'Adamczyk: Legendarny stream z Bimbeshem', 
		'Akademia Policyjna', 
		'Arcane', 
		'Arcane Sezon 2',
		'Arcydzieło, czyli dekalog producenta filmowego', 
		'Asterix Gall', 
		'Asterix i Kleopatra', 
		'12 Prac Asterixa',
		'Asterix kontra Cezar', 
		'Asterix w Brytanii', 
		'Wielka Bitwa Asterixa', 
		'Asterix podbija Amerykę', 
		'Asterix i Obelix kontra Cezar', 
		'Asterix i Obelix Misja Kleopatra', 
		'Asterix i Wikingowie', 
		'Asterix na olimpiadzie', 
		'Asterix i Obelix: Imperium Smoka', 
		'Auta', 
		'Auta 2', 
		'Auta 3', 
		'Avatar: Legenda Aanga Księga I - Woda', 
		'Avatar: Legenda Aanga Księga II - Ziemia', 
		'Avatar: Legenda Aanga Księga III - Ogień', 
		'Avatar: Legenda Korry Księga I - Powietrze', 
		'Avatar: Legenda Korry Księga II - Duchy', 
		'Avatar: Legenda Korry Księga III - Zmiana', 
		'Avatar: Legenda Korry Księga IV - Równowaga', 
		'Barbie', 
		'Berserk The Golden Age arc I: The egg of the king',
		'Bibliotekarz: Tajemnica Włóczni',
		'Bibliotekarz II: Tajemnice kopalni króla Salomona',
		'Bibliotekarz III: Klątwa kielicha Judasza',
		'Bionicle Maska Światła', 
		'Bionicle 2 Legendy Metru Nui', 
		'Bionicle 3 W sieci mroku', 
		'Bionicle Narodziny Legendy', 
		'Bleach: Arc 01 Agent Shinigami', 
		'Bleach: Arc 02 Soul Society: Wejście Donosiciela', 
		'Bleach: Arc 03 Soul Society: Ratunek', 
		'Bleach: Arc 06 Arrancar: Przybycie', 
		'Bleach: Arc 07 Arrancar: Wejście do Hueco Mundo', 
		'Bleach: Arc 08 Arrancar: Zacięty Bój', 
		'Bleach: Arc 17 Tysiącletnia krwawa wojna', 
		'Bleach: Arc 18 Tysiącletnia krwawa wojna - Separacja', 
		'Bleach: Arc 19 Tysiącletnia krwawa wojna - Konflikt',
		'Bobobo-Bo Bo-Bobo', 
		'Bocchi The Rock!', 
		'BOFURI: I don`t want to get hurt, so I`ll max out my defense', 
		'Breaking Bad Sezon 1', 
		'Breaking Bad Sezon 2', 
		'Breaking Bad Sezon 3', 
		'Breaking Bad Sezon 4', 
		'Breaking Bad Sezon 5', 
		'Bronzowe Myśli',
		'Bronzowe Taktyki',
		'Burn the Witch', 
		'But Manitou', 
		'Buty nieboszczyka', 
		'Był sobie kot',
		'Chainsaw Man', 
		'Chłopaki z baraków Sezon 1', 
		'Chłopaki z baraków Sezon 2', 
		'Chłopaki z baraków Sezon 3', 
		'Chłopaki z baraków Sezon 4', 
		'Chłopaki z baraków Sezon 5', 
		'Chłopaki z baraków Sezon 6', 
		'Chłopaki z baraków Sezon 7', 
		'Chomik', 
		'Chorobliwie Ostrożny Bohater', 
		'Czarnobyl', 
		'Czerwony Kapturek Prawdziwa Historia', 
		'Czerwony Kapturek 2 Pogromca Zła',
		'Dan Brown Kod Da Vinci', 
		'Dan Brown Anioły i Demony', 
		'Dan Brown Inferno', 
		'Deadpool', 
		'Deadpool 2', 
		'Deadpool i Wolverine', 
		'Demonzz1 Stream dekady', 
		'Demonzz1 Urodzinowa noc odkupienia', 
		'Detroit Metal City', 
		'Dorohedoro', 
		'Drive', 
		'Dumbbell Nan Kilo Moteru', 
		'Dzieciaki', 
		'Dzień świra',
		'Dziewczyna Influencera', 
		'Dziki Robot',
		'Ed Edd i Eddy Sezon 1',
		'Ed Edd i Eddy Sezon 2',
		'Ed Edd i Eddy Sezon 3',
		'Ed Edd i Eddy Sezon 4',
		'Ed Edd i Eddy Sezon 5',
		'Ed Edd i Eddy Odcinki specjalne',
		'Epoka Lodowcowa', 
		'Epoka Lodowcowa 2 Odwilż', 
		'Epoka Lodowcowa 3 Era dinozaurów', 
		'Epoka Lodowcowa 4 Wędrówka kontynentów', 
		'Epoka Lodowcowa 5 Mocne uderzenie', 
		'Epoka Lodowcowa Przygody dzikiego Bucka', 
		'Eromanga Sensei', 
		'Fallout', 
		'Fantasy Bishoujo Juniku Ojisan to', 
		'Fate/Zero', 
		'Fate Carnival Phantasm', 
		'Ferrari', 
		'Ferrari: Wyścig po nieśmiertelność', 
		'Film o Pszczołach', 
		'FilthyFrank The Cake Trilogy', 
		'FlexAir', 
		'Foodfight!', 
		'Fullmetal Alchemist Brotherhood', 
		'Gdzie jest Nemo', 
		'Gladiator', 
		'Gladiator II',
		'Goblin Slayer', 
		'Goblin Slayer Goblin`s Crown', 
		'Goblin Slayer II', 
		'Godzilla i Kong: Nowe Imperium', 
		'Godzilla: Minus One', 
		'Godziny szczytu',
		'Godziny szczytu 2',
		'Godziny szczytu 3',
		'Gothic Prawdziwa Historia', 
		'Gothic Prawdziwa Historia Kontynuacja Alternatywna', 
		'Gothic Prawdziwa Historia Remake', 
		'Grand Blue', 
		'Gran Turismo', 
		'Gucio GTA RP Seria 1', 
		'Gucio GTA RP Seria 2', 
		'Gwiezdne Wojny I Mroczne widmo', 
		'Gwiezdne Wojny II Atak Klonów', 
		'Gwiezdne Wojny III Zemsta Sithów', 
		'Gwiezdne Wojny IV Nowa nadzieja', 
		'Gwiezdne Wojny V Imperium Kontraatakuje', 
		'Gwiezdne Wojny VI Powrót Jedi', 
		'Gwiezdne Wojny Historie Łotr 1', 
		'Gwiezdne Wojny Historie Han Solo', 
		'Harry Potter i Kamień Filozoficzny',
		'Harry Potter i Komnata Tajemnic',
		'Harry Potter i więzień Azkabanu',
		'Harry Potter i Czara Ognia',
		'Harry Potter i Zakon Feniksa',
		'Harry Potter i Książę Półkrwi',
		'Harry Potter i Insygnia Śmierci Część 1',
		'Harry Potter i Insygnia Śmierci Część 2',
		'Fantastyczne Zwierzęta i jak je znaleźć',
		'Fantastyczne Zwierzęta: Zbrodnie Grindelwalda',
		'Fantastyczne Zwierzęta: Tajemnice Dumbledore`a',
		'Hazbin Hotel', 
		'Hellboy', 
		'Hellboy II Złota Armia', 
		'Iluzja', 
		'Iluzja 2', 
		'Iron Man', 
		'Iron Man 2', 
		'Iron Man 3', 
		'Isekai Ojisan', 
		'Ishuzoku Reviewers', 
		'Jack Strong', 
		'Jackie Chan - Pijany Mistrz', 
		'Jackie Chan - Zbroja Boga',
		'Jackie Chan - Zbroja Boga II',
		'Jackie Chan - Pierwsze uderzenie', 
		'Jackie Chan - Przyjemniaczek', 
		'Jackie Chan - Kowboj z Szanghaju', 
		'Jackie Chan - Rycerze z Szanghaju',
		'Jackie Chan - Agent z przypadku',  
		'Jigokuraku Hell`s Paradise', 
		'Job Czyli ostatnia szara komórka', 
		'Jojo`s Bizarre Adventure', 
		'Joker', 
		'Joker: Folie à Deux',
		'Jujutsu Kaisen',
		'Jujutsu Kaisen Zero', 
		'Jujutsu Kaisen 2',
		'Kac Vegas', 
		'Kaguya-Sama Love is War', 
		'Kaguya-Sama Love is War 2', 
		'Kaguya-Sama Love is War Ultra Romantic', 
		'Kapitan Bomba', 
		'Kapitan Bomba Laserowy Gniew Dzidy', 
		'Kapitan Bomba Kutapokalipsa', 
		'Kapitan Bomba Zemsta Faraona', 
		'Karate Kid',
		'Kaskader', 
		'Kevin sam w domu', 
		'Kevin sam w Nowym Jorku', 
		'Kiniro Mosaic', 
		'Klopsiki i inne zjawiska pogodowe', 
		'Kono Subarashii Sekai ni Shukufuku wo!', 
		'Kono Subarashii Sekai ni Shukufuku wo! 2', 
		'Kono Subarashii Sekai ni Shukufuku wo! Kurenai Densetsu', 
		'Kono Subarashii Sekai ni Shukufuku wo! 3', 
		'Kono Subarashii Sekai ni Bakuen wo!', 
		'Koralina i tajemnicze drzwi', 
		'Kosmiczny Mecz', 
		'Kot w Butach: Ostatnie Życzenie', 
		'Kryptonim: Klan Na Drzewie Sezon 1', 
		'Kryptonim: Klan Na Drzewie Sezon 2', 
		'Kryptonim: Klan Na Drzewie Sezon 3', 
		'Kryptonim: Klan Na Drzewie Sezon 4', 
		'Kryptonim: Klan Na Drzewie Sezon 5', 
		'Kryptonim: Klan Na Drzewie Sezon 6', 
		'Księga Ocalenia', 
		'Kung Fu Panda', 
		'Kung Fu Panda 2', 
		'Kung Fu Panda 3', 
		'Kung Fu Panda 4', 
		'Kung Fu Szał', 
		'Kurczak mały',
		'Lamborghini: Człowiek, który stworzył legendę', 
		'Le Mans `66 Ford vs Ferrari', 
		'Liga niezwykłych dżentelmenów', 
		'Lilo i Stich', 
		'Lilo i Stich 2 Mały feler Stitcha', 
		'Made in Abyss', 
		'Made in Abyss Dawn of The Deep Soul', 
		'Made in Abyss 2 The Golden City of the Scorching Sun', 
		'Magnaci i Czarodzieje', 
		'Mahou Shoujo ni Akogarete', 
		'Martin Tajemniczy', 
		'Martin Tajemniczy 2', 
		'Martin Tajemniczy 3', 
		'Megamocny', 
		'Miasto Gniewu', 
		'Mój brat niedźwiedź', 
		'Mój sąsiad Totoro', 
		'Mushoku Tensei', 
		'Mushoku Tensei Part 2', 
		'Mushoku Tensei 2', 
		'Mushoku Tensei 2 Part 2', 
		'Na Fali', 
		'Nekopara OVA', 
		'Nekopara OVA Koneko no Hi no Yakusoku', 
		'Nekopara', 
		'Nie zadzieraj z Fryzjerem', 
		'No Game No Life', 
		'No Game No Life Zero', 
		'Nowe szaty króla',
		'Nowe szaty króla 2 Kronk - Nowe wcielenie',
		'Odlot', 
		'O-Jik Geu-Dea-Man', 
		'One Piece', 
		'One Punch Man', 
		'One Punch Man 2', 
		'Oppenheimer', 
		'Orcs!', 
		'Ostatni Skaut', 
		'Palm Springs', 
		'Panty & Stocking with Garterbelt', 
		'Piorun', 
		'Piraci z Karaibów Klątwa Czarnej Perły', 
		'Piraci z Karaibów Skrzynia Umarlaka', 
		'Piraci z Karaibów Na krańcu świata', 
		'Piraci z Karaibów Na nieznanych wodach', 
		'Piraci z Karaibów Zemsta Salazara', 
		'Planeta 51', 
		'Planeta Skarbów', 
		'Podwodna Bestia', 
		'Potwory i spółka', 
		'Potwory i spółka Uniwersytet Potworny', 
		'Poznaj moich Spartan', 
		'Prison School', 
		'Pulp Fiction', 
		'Ralph Demolka', 
		'Ralph Demolka w internecie', 
		'Rango', 
		'ReZero: Kara Hajimeru Isekai Seikatsu', 
		'ReZero: Kara Hajimeru Isekai Seikatsu Wspomnienie śniegu', 
		'ReZero: Kara Hajimeru Isekai Seikatsu Więzi skute lodem', 
		'ReZero: Kara Hajimeru Isekai Seikatsu 2', 
		'ReZero: Kara Hajimeru Isekai Seikatsu 3', 
		'Roboty', 
		'Rybki z Ferajny',
		'RRRrrrr!!!', 
		'Samuraj Jack Sezon 1', 
		'Samuraj Jack Sezon 2', 
		'Samuraj Jack Sezon 3', 
		'Samuraj Jack Sezon 4', 
		'Sewayaki Kitsune no Senko-san', 
		'Sezon na misia', 
		'Shikanoko Nokonoko Koshitantan', 
		'Shoujo Ramune', 
		'Shrek', 
		'Shrek 2', 
		'Shrek Trzeci', 
		'Shrek Forever After', 
		'Solo Leveling', 
		'Sonic Szybki jak błyskawica',
		'Sonic Szybki jak błyskawica 2',
		'Sonic Szybki jak błyskawica 3',
		'Sonic X',
		'Sousou no Frieren', 
		'Spider-man', 
		'Spider-man 2', 
		'Spider-man 3', 
		'Spider-man Uniwersum', 
		'Spider-man Poprzez Multiwersum', 
		'Straszny Dom', 
		'Superhero Movie', 
		'Super Mario Bros', 
		'Super Mario Bros Film', 
		'Ściema po polsku', 
		'Taksówkarz', 
		'Taxi', 
		'TESTOVIRON Wszystkie filmy Chronologicznie', 
		'The Boys Sezon 1', 
		'The Boys Sezon 2', 
		'The Boys Sezon 3', 
		'The Boys Sezon 4', 
		'Toradora!', 
		'Turysta', 
		'Tytus Romek i A`Tomek wśród złodzei marzeń', 
		'Ucieczka z Nowego Yorku', 
		'Vinland Saga Sezon 1', 
		'Vinland Saga Sezon 2', 
		'W 80 dni dookoła świata',
		'Wakfu: Goultard Barbarzyńca', 
		'Dofus Skarby Keruba', 
		'Dofus: Księga 1 - Julith', 
		'Wakfu', 
		'Wakfu: Zegarmistrz Noximilien', 
		'Wakfu: Legenda o Ogreście', 
		'Wakfu Sezon 2', 
		'Wakfu: W poszukiwaniu Sześciu Dofusów Eliatropów', 
		'Wakfu Sezon 3', 
		'Wakfu: Oropo Bitwa o Eliacube', 
		'Wakfu Sezon 4', 
		'Wall-E', 
		'Wallace i Gromit Klątwa Królika', 
		'Who killed Captain Alex', 
		'Władca Pierścieni Drużyna Pierścienia', 
		'Władca Pierścieni Dwie Wieże', 
		'Władca Pierścieni Powrót Króla', 
		'Wodogrzmoty małe Sezon 1', 
		'Wodogrzmoty małe Sezon 2', 
		'Wodogrzmoty małe Odcinki specjalne', 
		'Wściekłe Pięści Węża', 
		'Wyspa Tajemnic', 
		'Wyspa Totalnej Porażki',
		'Wyścig', 
		'Xiaolin Pojedynek Mistrzów Sezon 1', 
		'Xiaolin Pojedynek Mistrzów Sezon 2', 
		'Xiaolin Pojedynek Mistrzów Sezon 3', 
		'Zabijaka', 
		'Zwierzogród', 
    ];

/*initiate the autocomplete function on the "myInput" element, and pass along the countries array as possible autocomplete values:*/
autocomplete(document.getElementById("myInput"), filmy);
