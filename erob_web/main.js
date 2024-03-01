const app = Vue.createApp({

    el: "#app",
    data() {
        return {
            // ros connection
            ros: null,
            config: true,
            rosbridge_address: 'ws://127.0.0.1:9090/',
            connected: false,
            error: false,
            // subscriber data
            cposition: {
                Joint1: 0.0,
                Joint2: 0.0,
                Joint3: 0.0,
                Joint4: 0.0,
                Joint5: 0.0,
                Joint6: 0.0,
            },

            j1: 0.00,
            j2: 0.00,
            j3: 0.00,
            j4: 0.00,
            j5: 0.00,
            j6: 0.00,
            delay: 0,
            title: '',
            history: [],
            // menu_title: 'Connection',
            // main_title: 'Main title, from Vue!!',
            keyValue: 'A',
            speed: 100,
            store: [],
            catTitle: '',
            actionName: '',
            actionList: [
                { "name": "Pick Up", "actionCmd": "/hand/pickup" },
                { "name": "Drop Off", "actionCmd": "/hand/dropoff" },
                { "name": "Go Home", "actionCmd": "/hand/home" },
                { "name": "Action 1", "actionCmd": "/hand/action1" },
                { "name": "Action 2", "actionCmd": "/hand/action2" },
                { "name": "Action 3", "actionCmd": "/hand/action3" },
                { "name": "Action 4", "actionCmd": "/hand/action4" },
            ],
            blink: 1,
            buzz: 1,

            catList: [],
            ShowOperations: false,
           
        }
    },
    methods: {
        connect: function () {
            // define ROSBridge connection object
            this.ros = new ROSLIB.Ros({
                url: this.rosbridge_address
            })

            // define callbacks
            this.ros.on('connection', () => {
                this.connected = true
                console.log('Connection to ROSBridge established!')

                this.todo()

            })
            this.ros.on('error', (error) => {
                this.error = true
                console.log('Something went wrong when trying to connect')
                console.log(error)
            })
            this.ros.on('close', () => {
                this.connected = false
                console.log('Connection to ROSBridge was closed!')
            })
            this.showData()
        },
        showData: function () {
            try {
                this.catTitle = document.getElementById('catTitle1').value;
                if (localStorage.getItem(this.catTitle) === null) {

                    localStorage.setItem(this.catTitle, JSON.stringify(this.store));
                }
                else {
                    
                    this.store = JSON.parse(localStorage.getItem(this.catTitle));
                }
            }
            catch (err) {

            }


            if (localStorage.getItem('catlist') === null) {

                localStorage.setItem('catlist', JSON.stringify(this.catList));
            }
            else {
                this.catList = JSON.parse(localStorage.getItem('catlist'));
            }

       


        },
        disconnect: function () {
            this.ros.close()
        },

        Stop: function () {
            var cmdVel = new ROSLIB.Topic({
                ros: this.ros,
                name: "/arm/stop",
                messageType: "std_msgs/msg/String",
            });
            var msg = new ROSLIB.Message({
                data: "stop"
            });

            cmdVel.publish(msg);
        },
        Disengage: function () {
            var cmdVel = new ROSLIB.Topic({
                ros: this.ros,
                name: "/arm/disengage",
                messageType: "std_msgs/msg/String",
            });
            var msg = new ROSLIB.Message({
                data: "disengage"
            });

            cmdVel.publish(msg);
        },
        addItem: function () {

            let item = {
                joint1: this.j1,
                joint2: this.j2,
                joint3: this.j3,
                joint4: this.j4,
                joint5: this.j5,
                joint6: this.j6
            }
            this.history.push(item)

            this.$refs.table.scrollIntoView({ block: "end" });
        },


        Delete: function (index) {
            // this.store.splice(this.store.indexOf(index), 1);  
            this.store.splice(index, 1);
            localStorage.setItem(this.catTitle, JSON.stringify(this.store));
        },
        DeleteFromCatList: function (index) {
            // this.store.splice(this.store.indexOf(index), 1);  
            this.catList.splice(index, 1);
            localStorage.setItem("catlist", JSON.stringify(this.catList));
        },
        docycle: async function () {
            this.store = JSON.parse(localStorage.getItem(this.catTitle));
            for (pos in this.store) {
                console.log(this.store[pos].value)
                this.sendWithTarget(this.store[pos].value)

                console.log(this.store[pos].value.delay )
                console.log(this.store[pos].value.title)

                while (!this.reach(this.store[pos].value))
                    {
                        await this.sleep(100)
                        // await console.log('wait')
                        
                    }
                await this.sleep(this.store[pos].value.delay-1 * 1000);
            }
        },
        doOperations: async function () {
            this.catList = JSON.parse(localStorage.getItem('catlist'));
            // console.log(this.catList[0])
            for (item in this.catList) {
                let data = JSON.parse(localStorage.getItem(this.catList[item].name));
                // console.log(data)
                for (pos in data) {
                    // console.log(pos)
                    if (data[pos].type == "Arm"){
                        console.log(data[pos].value.delay)
                        this.sendWithTarget(data[pos].value)
                        console.log(data[pos].value)
                        while (!this.reach(data[pos].value))
                        {
                            await this.sleep(100)
                            console.log('wait')                            
                        }
                        await this.sleep(data[pos].value.delay-1 * 1000);
                    }
                    else
                    {
                        console.log(data[pos].type)
                    }
                    // send(pos)
                    // while (this.reach(pos));
                    // sleep(pos.delay * 1000);
                }
            }


        },
        reach: function (target) {
            // console.log(Math.round(this.cposition.Joint1))
            // console.log(target.joint1)
  
            if ( Math.round( this.cposition.Joint1) != target.joint1)            
                return false;
            if ( Math.round(  this.cposition.Joint2 )!=  target.joint2 ) 
                return false;
            if (  Math.round( this.cposition.Joint3) !=target.joint3 ) 
                return false;
            if ( Math.round(  this.cposition.Joint4) !=target.joint4 ) 
                return false;
            if ( Math.round(  this.cposition.Joint5) !=target.joint5 ) 
                return false;
            if ( Math.round(  this.cposition.Joint6) !=target.joint6 ) 
                return false;
            return true;
        },
        sleep: function(milliseconds) {
            // return new Promise((resolve) => setTimeout(resolve, milliseconds));
            return new Promise(resolve => setTimeout(resolve, milliseconds));
        },
        currentPosition: function () {
            this.j1 = Math.round(this.cposition.Joint1)
            this.j2 = Math.round(this.cposition.Joint2)
            this.j3 = Math.round(this.cposition.Joint3)
            this.j4 = Math.round(this.cposition.Joint4)
            this.j5 = Math.round(this.cposition.Joint5)
            this.j6 = Math.round(this.cposition.Joint6)
        },
        showPosition: function () {
            var listener = new ROSLIB.Topic({
                ros: this.ros,
                name: "/arm/state",
                messageType: "sensor_msgs/msg/JointState",
            });
            listener.subscribe((message) => {
                //    this.cposition= listener.subscribe(function (message) {

                let poses = message.position;
                // console.log(poses[0]);
                let txt = "";
                let i = 0;
                for (let x in poses) {
                    p = ((poses[x] * 180) / Math.PI) % 360;
                    if (p > 180) {
                        p = p - 360;
                    }
                    poses[x] = p;
                }

                listener.unsubscribe();
                let item = {
                    Joint1: poses[0],
                    Joint2: poses[1],
                    Joint3: poses[2],
                    Joint4: poses[3],
                    Joint5: poses[4],
                    Joint6: poses[5],
                }

                this.cposition = item;
            });

            // return item
        },
        send: function () {
            var cmdVel = new ROSLIB.Topic({
                ros: this.ros,
                name: "/arm/command",
                messageType: "sensor_msgs/msg/JointState",
            });


            rj1 = (this.j1 * Math.PI) / 180;
            rj2 = (this.j2 * Math.PI) / 180;
            rj3 = (this.j3 * Math.PI) / 180;
            rj4 = (this.j4 * Math.PI) / 180;
            rj5 = (this.j5 * Math.PI) / 180;
            rj6 = (this.j6 * Math.PI) / 180;

            // rj1 = (parseFloat(j1) * Math.PI) / 180;
            // rj2 = (parseFloat(j2) * Math.PI) / 180;
            // rj3 = (parseFloat(j3) * Math.PI) / 180;
            // rj4 = (parseFloat(j4) * Math.PI) / 180;
            // rj5 = (parseFloat(j5) * Math.PI) / 180;
            // rj6 = (parseFloat(j6) * Math.PI) / 180;
            let newspeed = this.speed * 4;
            var JointState = new ROSLIB.Message({
                name: ["j1", "j2", "j3", "j4", "j5", "j6"],
                position: [rj1, rj2, rj3, rj4, rj5, rj6],
                velocity: [newspeed, newspeed, newspeed, newspeed, newspeed, newspeed],
                effort: [],
            });
            cmdVel.publish(JointState);

            this.addItem()

        },
        sendWithTarget: function (target) {
            var cmdVel = new ROSLIB.Topic({
                ros: this.ros,
                name: "/arm/command",
                messageType: "sensor_msgs/msg/JointState",
            });


            rj1 = (target.joint1 * Math.PI) / 180;
            rj2 = (target.joint2 * Math.PI) / 180;
            rj3 = (target.joint3 * Math.PI) / 180;
            rj4 = (target.joint4 * Math.PI) / 180;
            rj5 = (target.joint5 * Math.PI) / 180;
            rj6 = (target.joint6 * Math.PI) / 180;

            let newspeed = this.speed * 4;
            var JointState = new ROSLIB.Message({
                name: ["j1", "j2", "j3", "j4", "j5", "j6"],
                position: [rj1, rj2, rj3, rj4, rj5, rj6],
                velocity: [newspeed, newspeed, newspeed, newspeed, newspeed, newspeed],
                effort: [],
            });
            cmdVel.publish(JointState);

            // this.addItem()

        },
        clearHistory: function () {
            this.history = '';
        },
        clearPositions: function () {
            localStorage.setItem('', JSON.stringify([]));
            this.store=[];
        },
        todo: function () {
            this.intervalid1 = setInterval(() => {
                this.showPosition();
            }, 1000);

        },
        getKey(evt) {
            this.keyValue = evt.key
            console.log(evt.key)
            // this.speed = 25
            switch (this.keyValue) {
                case 'z':
                    this.j1--;
                    this.send()
                    break;
                case 'x':
                    this.j1++;
                    this.send()
                    break;

                case 'a':
                    this.j2--;
                    this.send()
                    break;
                case 's':
                    this.j2++;
                    this.send()
                    break;

                case 'q':
                    this.j3--;
                    this.send()
                    break;
                case 'w':
                    this.j3++;
                    this.send()
                    break;

                case 'n':
                    this.j4--;
                    this.send()
                    break;
                case 'm':
                    this.j4++;
                    this.send()
                    break;

                case 'k':
                    this.j5--;
                    this.send()
                    break;
                case 'l':
                    this.j5++;
                    this.send()
                    break;

                case 'o':
                    this.j6--;
                    this.send()
                    break;
                case 'p':
                    this.j6++;
                    this.send()
                    break;
                case 'Enter', 'Escape', ' ':
                    console.log('Stop');
                    this.Stop()
                    break;
            }

            // this.speed = 100
        },

        addPosition: function () {

            let item = {
                type: "Arm",
                value: {
                    joint1: this.j1,
                    joint2: this.j2,
                    joint3: this.j3,
                    joint4: this.j4,
                    joint5: this.j5,
                    joint6: this.j6,
                    speed: this.speed,
                    delay: this.delay,
                    title: this.title,
                },
            }
            // let positions = localStorage.getItem("positions");
            // positions.addItem(item);
            this.store.push(item);
            localStorage.setItem(this.catTitle, JSON.stringify(this.store));
        },

        addBlink: function () {
            let item = {
                type: "LED",
                value: {
                    reapet: this.blink,
                }
            }
            // let positions = localStorage.getItem("positions");
            // positions.addItem(item);
            this.store.push(item)
            localStorage.setItem(this.catTitle, JSON.stringify(this.store));

        },
        addBuzz: function () {
            let item = {
                type: "Buzzer",
                value: {
                    reapet: this.buzz,
                }
            }
            // let positions = localStorage.getItem("positions");
            // positions.addItem(item);
            this.store.push(item)
            localStorage.setItem(this.catTitle, JSON.stringify(this.store));


        },
        addHandAction: function () {
            let item = {
                type: "Hand",
                value: {
                    action: this.actionName,
                }
            }
            // let positions = localStorage.getItem("positions");
            // positions.addItem(item);
            this.store.push(item)
            localStorage.setItem(this.catTitle, JSON.stringify(this.store));

        },
        AddToCatList: function () {
            this.catTitle = document.getElementById('catTitle1').value;

            let item = {
                name: this.catTitle,
            }
            console.log(this.catTitle)
            console.log(item)
            this.catList.push(item)
            localStorage.setItem('catlist', JSON.stringify(this.catList));
        },

        saveWorkspace: function () {
            localStorage.setItem(this.catTitle, JSON.stringify(this.store));

            saveWorkspace()
        },
        modal: function (name) {

            this.store = JSON.parse(localStorage.getItem(name));
        },




    },

    mounted() {
        // page is ready
        console.log('page is ready!');
        this.showData()
    },
})


app.mount('#app')