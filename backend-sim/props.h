//
// Created by jscarsdale on 5/4/20.
//
#ifndef BACKEND_SIM_PROPS_H
#define BACKEND_SIM_PROPS_H

class Props {
public:
    Props() {}
    int init(const std::string& configFile);

private:
    boost::property_tree::ptree _propTree;
};

#endif //BACKEND_SIM_PROPS_H
