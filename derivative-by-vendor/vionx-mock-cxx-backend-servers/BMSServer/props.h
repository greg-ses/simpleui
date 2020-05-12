//
// Created by jscarsdale on 5/4/20.
//
#ifndef BMSSERVER_PROPS_H
#define BMSSERVER_PROPS_H

class Props {
public:
    Props() {}
    int init(const std::string& configFile);

private:
    boost::property_tree::ptree _propTree;
};

#endif //BMSSERVER_PROPS_H
