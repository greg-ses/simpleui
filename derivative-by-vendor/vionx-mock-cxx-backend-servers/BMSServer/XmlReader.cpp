//
// Created by jscarsdale on 5/9/20.
//

#include "boost/filesystem/operations.hpp"
#include "XmlReader.h"

namespace fs = boost::filesystem;

// Static class members
std::map<std::string, pt::ptree*> XmlReader::loadedXmlFiles;

pt::ptree* XmlReader::loadXmlTree(const std::string& fileName) {
    pt::ptree* xmlTree = nullptr;
    try {
        if (! fs::is_regular_file(fileName)) {
            return nullptr;
        }
    auto pair = loadedXmlFiles.find(fileName);
    if (pair == loadedXmlFiles.end()) {
        xmlTree = new pt::ptree();
        // Parse the XML into the property tree.
        pt::read_xml(fileName, *xmlTree);
        loadedXmlFiles[fileName] = xmlTree;
    } else {
        xmlTree = pair->second;
    }
    } catch(std::exception &e) {
        std::cerr << "Error: " << e.what() << "\n";
    }

    return xmlTree;
}

pt::ptree* XmlReader::getXmlTree(const std::string& filename) {
    return XmlReader::loadXmlTree(filename);
}

XmlReader::~XmlReader() {
    for(auto it = loadedXmlFiles.begin(); it != loadedXmlFiles.end(); ) {
            delete it->second;
    }
    loadedXmlFiles.clear();
}

/*
void XmlReader::save()
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

