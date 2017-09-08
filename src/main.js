window.onload = function() {
    window.app = new Vue({
        el: '#vue',
        data: {
            
            parties: [
                {
                    alias: "act",
                    name: "ACT New Zealand",
                    list: null,
                    leaders: [
                        "David Seymour"
                    ],
                    color: ""
                },
                {
                    alias: "green",
                    name: "Green Party",
                    list: null,
                    leaders: [
                        "James Shaw"
                    ],
                    color: ""
                },
                {
                    alias: "labour",
                    name: "Labour Party",
                    list: null,
                    leaders: [
                        "Jacinda Ardern"
                    ],
                    color: ""
                },
                {
                    alias: "mana",
                    name: "MANA",
                    list: null,
                    leaders: [
                        "Hone Harawira"
                    ],
                    color: ""
                },
                {
                    alias: "maori",
                    name: "Māori Party",
                    list: null,
                    leaders: [
                        "Te Ururoa Flavell",
                        "Marama Fox"
                    ],
                    color: ""
                },
                {
                    alias: "national",
                    name: "National Party",
                    list: null,
                    leaders: [
                        "Bill English"
                    ],
                    color: ""
                },
                {
                    alias: "nzf",
                    name: "New Zealand First Party",
                    list: null,
                    leaders: [
                        "Winston Peters"
                    ],
                    color: ""
                },
                {
                    alias: "top",
                    name: "The Opportunities Party (TOP)",
                    list: null,
                    leaders: [
                        "Gareth Morgan"
                    ],
                    color: ""
                },
                {
                    alias: "uf",
                    name: "United Future",
                    list: null,
                    leaders: [
                        "Damian Light"
                    ],
                    color: ""
                },
            ],

            electorates: {},
        },

        created: function() {
            this.loadPartyList("act", "data/ACT.csv");
            this.loadPartyList("green", "data/Green.csv");
            this.loadPartyList("labour", "data/Labour.csv");
            this.loadPartyList("mana", "data/Mana.csv");
            this.loadPartyList("maori", "data/Maori.csv");
            this.loadPartyList("national", "data/National.csv");
            this.loadPartyList("nzf", "data/NZF.csv");
            this.loadPartyList("top", "data/TOP.csv");
            this.loadPartyList("uf", "data/UF.csv");

            this.loadElectorates("data/electorates.csv")
        },

        methods: {
            loadPartyList: function(alias, fileName) {    
                let app = this;
                
                function listener() {
                    let list = this.responseText;

                    let parsedList = app.parseList(list);
                    // console.log(parsedList);

                    let party = app.parties.filter(p => p.alias === alias)[0];
                    party.list = parsedList;
                }
            
                let request = new XMLHttpRequest();
                request.addEventListener("load", listener);
                request.open("GET", fileName);
                request.send();
            },

            parseList: function(list) {
                let obj = {};

                lines = list.split("\n");

                for (key in lines) {
                    let fields = lines[key].split(/,(.+)/);
                    let number = fields[0];
                    let name = fields[1];
                    name = this.parseName(name);

                    obj[number] = name;
                }
                return obj;
            },

            parseName: function(name) {
                name = name.replace(/"/g, '');
                names = name.split(",");

                // left-trim the first name:
                names[1] = names[1].replace(/^\s+/,"");
            
                // proper-case the surname:
                names[0] = this.properCaseName(names[0]);

                return names[1] + " " + names[0];
            },

            loadElectorates: function(fileName) {    
                let app = this;
                
                function listener() {
                    let data = this.responseText;
                    app.electorates = app.parseElectorates(data);
                }
            
                let request = new XMLHttpRequest();
                request.addEventListener("load", listener);
                request.open("GET", fileName);
                request.send();
            },

            parseElectorates: function(data) {
                let obj = {};

                lines = data.split("\n");

                for (key in lines) {
                    let fields = lines[key].split(",");
                    if (fields.length < 4) continue;

                    let electorate = fields[0];
                    let lastName = fields[1];
                    let firstName = fields[2];
                    let party = fields[3];

                    lastName = this.properCaseName(lastName);

                    if (typeof obj[electorate] === 'undefined') {
                        obj[electorate] = [];
                    }
                    obj[electorate].push({
                        name: firstName + " " + lastName,
                        party: party
                    });
                }
                return obj;
            },

            properCaseName: function(str) {
                str = str.replace(/\w\S*/g, function(txt) {
                    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                });

                function capitalizeAfter(str, seq) {
                    if (str.lastIndexOf(seq) > -1) {
                        let idx = str.lastIndexOf(seq) + seq.length;
                        str = str.split("");
                        str[idx] = str[idx].toUpperCase();
                        str = str.join("");
                    }
                    return str;
                }
                
                // Special case for "O'Connor", "O'Sullivan", etc.
                str = capitalizeAfter(str, "O'");
                
                // Special case for double-barrel surnames. 
                str = capitalizeAfter(str, "-");
                
                // Special case for 'McLovin', etc.
                str = capitalizeAfter(str, "Mc");
                
                return str;
            }
        }
    });

}