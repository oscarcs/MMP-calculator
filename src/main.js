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
                    color: "#841100",
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
            electoratesLoaded: false,

            // Search box properties:
            electorateSearch: "",
            electorateSearchResults: [],

            // Seat distributions properties:
            seats: {},
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

            this.loadElectorates("data/electorates.csv");

            for (let i in this.parties) {
                this.parties[i].current = this.parties[i].previous;
            }
        },

        methods: {

            saveData: function() {
                console.log("Saving data...");

                let electorates = JSON.stringify(this.electorates);
                let parties = JSON.stringify(this.parties);

                localStorage.setItem("electorates", electorates);
                localStorage.setItem("parties", parties);
            },

            loadData: function() {
                console.log("Loading data...");

                let electorates = localStorage.getItem("electorates"); 
                let parties = localStorage.getItem("parties"); 
                
                if (electorates !== null && parties !== null) {
                    this.electorates = JSON.parse(electorates);
                    this.parties = JSON.parse(parties);
                }
            },

            resetData: function() {
                localStorage.removeItem("electorates");
                localStorage.removeItem("parties");
                location.reload();
            },

            loadPartyList: function(alias, fileName) {    
                let app = this;
                
                function listener() {
                    let list = this.responseText;

                    let parsedList = app.parseList(list);

                    let party = app.parties.filter(p => p.alias === alias)[0];
                    party.list = parsedList;

                    console.log(party.list);
                }
            
                let request = new XMLHttpRequest();
                request.addEventListener("load", listener);
                request.open("GET", fileName);
                request.send();
            },

            loadElectorates: function(fileName) {    
                let app = this;
                
                function listener() {
                    let data = this.responseText;
                    app.electorates = app.parseElectorates(data);

                    console.log(app.electorates);

                    app.electoratesLoaded = true;

                    // Load saved data.
                    app.loadData();

                    // Set a timeout to periodically load data.
                    setInterval(() => app.saveData(), 10000);
                }
            
                let request = new XMLHttpRequest();
                request.addEventListener("load", listener);
                request.open("GET", fileName);
                request.send();
            },

            parseList: function(list) {
                let obj = {};

                list = list.replace(/\r\n/g, "\n");
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

            parseElectorates: function(data) {
                let electorates = [];

                data = data.replace(/\r\n/g, "\n");
                lines = data.split("\n");

                for (key in lines) {
                    let fields = lines[key].split(",");
                    if (fields.length < 4) continue;

                    let name = fields[0];
                    let lastName = fields[1];
                    let firstName = fields[2];
                    let party = this.parties.find(x => x.alias == fields[3]) || fields[3];
                    let incumbent = fields[4] === "true";

                    if (party === '') party = "Independent";

                    lastName = this.properCaseName(lastName);

                    let electorate = electorates.find(x => x.name === name);

                    if (typeof electorate === 'undefined') {
                        electorate = {
                            name: name,
                            candidates: [],
                            previous: null,
                            current: null
                        };
                        electorates.push(electorate);
                    }

                    let candidate = {
                        name: firstName + ' ' + lastName,
                        party: party
                    };

                    electorate.candidates.push(candidate);
                    if (incumbent) {
                        electorate.previous = candidate;
                        electorate.current = candidate;
                    }
                }
                return electorates;
            },

            searchElectorate: function(query) {
                let results = [];
                
                if (query == '') {
                    return results;
                }
                
                let re;
                try {
                    re = new RegExp('^' + query, 'i');
                }
                catch (e) {
                    return results;
                }

                // Search each word in the names of the electorates
                for (i in this.electorates) {
                    let nameParts = this.electorates[i].name.split(" ");
                    for (j in nameParts) {
                        if (nameParts[j].toLowerCase() === "of" ||
                            nameParts[j].toLowerCase() === "the"
                        ) {
                            continue;
                        }

                        if (re.test(nameParts[j])) {
                            results.push(this.electorates[i]);
                            break;
                        }
                    }
                }
                return results;
            },

            getElectorateTotals() {
                let data = [];

                for (i in this.electorates) {
                    if (this.electorates[i].current === null) {
                        continue;
                    } 

                    let currentParty = this.electorates[i].current.party;
                    let existing;
                    if (typeof currentParty === 'string') {
                        existing = data.find(x => x.party === currentParty);
                    }
                    else {
                        existing = data.find(x => x.party.name === currentParty.name);
                    }

                    if (typeof existing === 'undefined') {
                        data.push({
                            party: currentParty,
                            seats: 1
                        });
                    }
                    else {
                        existing.seats++;
                    }
                }

                data.sort((x, y) => y.seats - x.seats);
                    
                return data;
            },
            
            getSwing: function(previous, current) {
                if (isNaN(previous) || isNaN(current)) {
                    return 0 + "";
                }

                let val = Math.round((current - previous) * 100) / 100;
                return previous < current ? "+" + val : val; 
            },

            getBadge: function(party, useOverride) {
                
                if (typeof party === 'string') {
                    let abbreviation = ""; 
                    let color = "";
                    let override = false;

                    switch (party) {
                        case "MANA":
                            abbreviation = "MAN";
                            color = "#ef5151";
                            break; 

                        case "Conservative":
                            abbreviation = "CON";
                            color = "#56B3FF";
                            break;

                        case "Aotearoa Legalise Cannabis Party":
                            abbreviation = "ALCP";
                            color = "#88e2a0";
                            break;

                        case "Democrats for Social Credit":
                            abbreviation = "DSC";
                            color = "#005617";
                            break;

                        case "Independent":
                            abbreviation = "IND";
                            color = "#878787";
                            break;
                            
                        default:
                            abbreviation = "";
                            color = "#878787";
                            override = true;
                    }

                    if (useOverride && override) {
                        color = "white"; 
                    }

                    return {

                        abbreviation: abbreviation,
                        style: {
                            color: "white",
                            backgroundColor: color
                        }
                    };
                }
                else {
                    return {
                        abbreviation: party.abbreviation,
                        style: {
                            color: "white",
                            backgroundColor: party.color
                        }
                    };
                }
            },

            calculateSeats: function() {
                let parties = [];
                let electorates = [];

                if (!this.electoratesLoaded) {
                    return [];
                }
                
                let getParty = x => (x.current.party.name || x.current.party);

                for (let i in this.parties) {
                    parties.push({
                        name: this.parties[i].name,
                        votes: Math.round(this.parties[i].current * 10000) / 100, 
                    });
                }

                for (let i in this.electorates) {
                    var electorateParty = electorates.find(x => x.name === getParty(this.electorates[i]));

                    if (typeof electorateParty === 'undefined') {
                        electorates.push({
                            name: getParty(this.electorates[i]),
                            seats: 1
                        });
                    }
                    else {
                        electorateParty.seats++;
                    }
                }

                let parliament = calculateMMP(parties, electorates, 10000);

                let seats = [];
                for (let i in parliament.parties) {
                    let foundParty = this.parties.find(x => x.name === parliament.parties[i].name);
                    let party = typeof foundParty !== 'undefined' ? foundParty : parliament.parties[i].name;
                    let badge = this.getBadge(party);

                    seats.push({
                        badge: badge,
                        seats: parliament.parties[i].quota,
                        party: party
                    });
                }

                seats.sort((x, y) => y.seats - x.seats);                

                this.seats = seats;
                return seats;
            },

        }
    });

}