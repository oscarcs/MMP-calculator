window.onload = function() {
    window.app = new Vue({
        el: '#vue',
        data: {
            
            // Data properties:

            parties: [
                {
                    abbreviation: "NAT",
                    alias: "national",
                    name: "National",
                    list: null,
                    leaders: [
                        "Bill English"
                    ],
                    color: "#256fe8",
                    previous: 47.04,
                    current: 0
                },
                {
                    abbreviation: "LAB",
                    alias: "labour",
                    name: "Labour",
                    list: null,
                    leaders: [
                        "Jacinda Ardern"
                    ],
                    color: "#e52b2b",
                    previous: 25.13,
                    current: 0
                },
                {
                    abbreviation: "NZF",
                    alias: "nzf",
                    name: "New Zealand First",
                    list: null,
                    leaders: [
                        "Winston Peters"
                    ],
                    color: "#333333",
                    previous: 8.66,
                    current: 0
                },
                {
                    abbreviation: "GRN",
                    alias: "green",
                    name: "Green",
                    list: null,
                    leaders: [
                        "James Shaw"
                    ],
                    color: "#00c760",
                    previous: 10.70,
                    current: 0
                },
                {
                    abbreviation: "MAO",
                    alias: "maori",
                    name: "Maori Party",
                    list: null,
                    leaders: [
                        "Te Ururoa Flavell",
                        "Marama Fox"
                    ],
                    color: "#4f0e00",
                    previous: 1.32,
                    current: 0
                },
                {
                    abbreviation: "ACT",
                    alias: "act",
                    name: "ACT",
                    list: null,
                    leaders: [
                        "David Seymour"
                    ],
                    color: "#f9df13",
                    previous: 0.69,
                    current: 0 
                },
                {
                    abbreviation: "TOP",
                    alias: "top",
                    name: "The Opportunities Party",
                    list: null,
                    leaders: [
                        "Gareth Morgan"
                    ],
                    color: "#dddddd",
                    previous: 0,
                    current: 0
                },
                {
                    abbreviation: "UF",
                    alias: "uf",
                    name: "United Future",
                    list: null,
                    leaders: [
                        "Damian Light"
                    ],
                    color: "#520082",
                    previous: 0.22,
                    current: 0
                },
            ],

            electorates: {},

            // Search box properties:

            electorateSearch: "",
            electorateSearchResults: [],
        },

        watch: {
            electorateSearch: function(query) {
                this.electorateSearchResults = this.searchElectorate(query);
            }
        },

        created: function() {
            this.loadPartyList("act", "data/ACT.csv");
            this.loadPartyList("green", "data/Green.csv");
            this.loadPartyList("labour", "data/Labour.csv");
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

                lines = data.split("\r\n");

                for (key in lines) {
                    let fields = lines[key].split(",");
                    if (fields.length < 4) continue;

                    let electorate = fields[0];
                    let lastName = fields[1];
                    let firstName = fields[2];
                    let party = this.parties.find(x => x.alias == fields[3]) || fields[3];

                    if (party === '') party = "Independent";

                    lastName = this.properCaseName(lastName);

                    if (typeof obj[electorate] === 'undefined') {
                        obj[electorate] = [];
                    }
                    obj[electorate].push({
                        name: firstName + ' ' + lastName,
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
                
                // Special case for 'O'Connor', 'O'Sullivan', etc.
                str = capitalizeAfter(str, "O'");
                
                // Special case for 'Double-Barrel' surnames. 
                str = capitalizeAfter(str, "-");
                
                // Special case for 'McLovin', etc.
                str = capitalizeAfter(str, "Mc");
                
                return str;
            },

            searchElectorate: function(query) {
                if (query == '') {
                    return [];
                }

                let re = new RegExp('^' + query, 'i');
                let results = [];

                // Search each word in the names of the electorates
                for (name in this.electorates) {
                    let nameParts = name.split(" ");
                    for (i in nameParts) {
                        if (nameParts[i].toLowerCase() === "of" ||
                            nameParts[i].toLowerCase() === "the"
                        ) {
                            continue;
                        }

                        if (re.test(nameParts[i])) {
                            results.push({
                                name: name,
                                candidates: this.electorates[name]
                            });
                            break;
                        }
                    }
                }
                return results;
            },
            
            getSwing: function(previous, current) {
                if (isNaN(previous) || isNaN(current)) {
                    return 0 + "";
                }

                let val = Math.round((current - previous) * 100) / 100;
                return previous < current ? "+" + val : val; 
            },

            getBadgeStyle: function(party) {
                return {
                    color: "white",
                    backgroundColor: party.color
                };
            }
        }
    });

}