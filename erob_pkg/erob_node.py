from gc import garbage
from pickle import TRUE
from matplotlib.dates import date_ticker_factory
from numpy import angle
from sympy import false, true
import rclpy
from rclpy.node import Node
import struct

# import time
from time import sleep

import random

# from rclpy.callback_groups import MutuallyExclusiveCallbackGroup
from rclpy.executors import MultiThreadedExecutor

from std_msgs.msg import String
from sensor_msgs.msg import JointState


number_of_slaves =6




output_velocity = (int)((1 * 524288) / 360) # 1 deg/s
basestep = 400   # max 500  
PI=3.141592653589793
target=[0,0,0,0,0,0]
step=[0,0,0,0,0,0]
data=[0,0,0,0,0,0]
olddata=[0,0,0,0,0,0]

#--------------------------------------
        
def postodegree(pos):
    # pos can be negetive
    enc= 524288.0
    x= pos % enc
    degree = float(float(x)/enc)*360.0  
    return round(degree, 2)

#--------------------------------------


class ErobNode(Node): 
    def __init__(self):
        super().__init__("erob_node")
        self._logger.info("ARM Is Ready")

        self.co=1
        self.running =True      

        self.subscription1 = self.create_subscription(
            JointState,
            'arm/command',
            self.listener_callback,
            10)
        
        self.subscription2 = self.create_subscription(
            String,
            'arm/stop',
            self.listener_stop_callback,
            1)
        

        timer_period = 0.2
        self.publisher_ = self.create_publisher(JointState, 'arm/state', 10)
        self.timer = self.create_timer(timer_period, self.timer_callback)

  


    def get_radians(self):
        positions=[0,0,0,0,0,0]
        
        random.seed()

        for i in range(number_of_slaves):
            positions[i]=( (random.random()*360 -180) * PI ) / 180
        return positions
    
    def timer_callback(self):

        base_Velocity = 10
        joints = JointState()
        
        joints.name = ['j1', 'j2', 'j3','j4', 'j5', 'j6']
        # joints.position = [0.763331, 0.415979, -1.728629, 1.482985, -1.135621, -1.674347, -0.496337]
        joints.position = self.get_radians()
        joints.velocity = [base_Velocity,base_Velocity,base_Velocity,base_Velocity,base_Velocity,base_Velocity]
        joints.effort = []

        joints.header.stamp = self.get_clock().now().to_msg()

        self.publisher_.publish(joints)

    
    def listener_stop_callback(self,msg):
        print(f'Listener callback: ***** STOP *****')
        for i in range(number_of_slaves):
            step[i]=0
        self.running = True
        


    def listener_callback(self, joints):
        
        # self.check_run()

        angle=[0,0,0,0,0,0]
        sleep(0.01)
        print(f'Listener callback: {joints.position}')
      
                
    
    def check_run(self):
        while self.running == True:
            reached =0
            for i in range(number_of_slaves):
                if abs(step[i]) <= 50 :
                    reached+=1
            if reached == number_of_slaves:
                self.running == False
                print('Arm is ready')
                return
            sleep(0.2)
            
        
        # print(f'        Steps: {step}')
        # print(f'        Traget Positions: {target}')
        # print(f'        Traget Angles: {angle}')




def main(args=None):
    rclpy.init(args=args)
    # adapters = pysoem.find_adapters()

 
    print('main done')
    
    node = ErobNode() 
    rclpy.spin(node)
    rclpy.shutdown()


 
if __name__ == "__main__":
    main()


    
# ros2 topic pub --once /arm/command sensor_msgs/msg/JointState "{name: ["j1", "j2", "j3", "j4", "j5", "j6"],position: [-0.5236,-0.5236,-0.5236,-0.5236,-0.5236,-0.5236]}" --once
# ros2 topic pub --once /arm/command sensor_msgs/msg/JointState "{name: ["j1", "j2", "j3", "j4", "j5", "j6"],position: [0.5236,0.5236,0.5236,0.5236,0.5236,0.5236]}" --once
# ros2 topic pub --once /arm/command sensor_msgs/msg/JointState "{name: ["j1", "j2", "j3", "j4", "j5", "j6"],position: [0, 0, 0, 0, 0, 0]}" --once

# ros2 topic pub --once /arm/command sensor_msgs/msg/JointState "{name: ["j1", "j2", "j3", "j4", "j5", "j6"],position: [1.047, 1.047, 1.047, 1.047, 1.047, 1.047]}" --once

# ros2 topic pub --once /arm/command sensor_msgs/msg/JointState "{name: ["j1", "j2", "j3", "j4", "j5", "j6"],position: [1.62, 0.86, 0.28, 3.60, 1.04, 1.55],velocity:[ 1, 2, 2, 3, 4 , 4],effort: [ 1, 2, 2, 3, 4 , 4]}" --once