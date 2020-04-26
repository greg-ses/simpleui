//
// Created by jscarsdale on 4/16/20.
//
#include "SimState.h"
#include <regex>

SimState::SimState() {
}

void SimState::initXmlTemplate(std::string fileTemplate, int numFiles = 1) {
    try
    {
        _numFiles = numFiles;
        _fileTemplate = fileTemplate;
        std::string fileName = fileTemplate;
        if (numFiles > 1) {
            fileName = std::regex_replace(fileName, std::regex("\\{\\{index}}"), "0");
        }
        loadXml(fileName);
    }
    catch (std::exception &e)
    {
        std::cerr << "Error: " << e.what() << "\n";
    }
}

void SimState::loadXml(const std::string &filename)
{
    // Parse the XML into the property tree.
    pt::read_xml(filename, _xmlTree);

    /*
    // Use the throwing version of get to find the debug filename.
    // If the path cannot be resolved, an exception is thrown.
    m_file = tree.get<std::string>("debug.filename");

    // Use the default-value version of get to find the debug level.
    // Note that the default value is used to deduce the target type.
    m_level = tree.get("debug.level", 0);

    // Use get_child to find the node containing the modules, and iterate over
    // its children. If the path cannot be resolved, get_child throws.
    // A C++11 for-range loop would also work.
    BOOST_FOREACH(pt::ptree::value_type &v, tree.get_child("debug.modules")) {
                    // The data function is used to access the data stored in a node.
                    m_modules.insert(v.second.data());
                }
    */
}

std::string SimState::getXmlStr() const {
    std::stringstream ss;
    pt::write_xml(ss, _xmlTree);
    return ss.str();
}

/*
void SimState::save()
{
    // Create an empty property tree object.
    pt::ptree tree;

    // Put the simple values into the tree. The integer is automatically
    // converted to a string. Note that the "debug" node is automatically
    // created if it doesn't exist.
    tree.put("debug.filename", m_file);
    tree.put("debug.level", m_level);

    // Add all the modules. Unlike put, which overwrites existing nodes, add
    // adds a new node at the lowest level, so the "modules" node will have
    // multiple "module" children.
    BOOST_FOREACH(const std::string &name, m_modules)
                    tree.add("debug.modules.module", name);

    // Write property tree to XML file
    pt::write_xml(currentStateFilename, tree);
}
*/

